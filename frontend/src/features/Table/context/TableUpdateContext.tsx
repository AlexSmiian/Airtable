"use client";

import React, {createContext, useContext, useRef, useCallback, useState, useEffect} from 'react';
import {useQueryClient, InfiniteData} from '@tanstack/react-query';
import {IRecord} from "@/features/Table/types/table";

interface UpdateMessage {
    type: string;
    payload: any;
}

interface PendingUpdate {
    id: number;
    field: string;
    value: any;
    timestamp: number;
    previousData?: InfiniteData<IRecord[]>;
}

interface TableUpdateContextValue {
    sendUpdate: (id: number, field: string, value: any) => void;
    isConnected: boolean;
    lastMessage: UpdateMessage | null;
    pendingUpdates: Map<string, PendingUpdate>;
}

const TableUpdateContext = createContext<TableUpdateContextValue | null>(null);

export function useTableUpdate() {
    const context = useContext(TableUpdateContext);
    if (!context) throw new Error('useTableUpdate must be used within TableUpdateProvider');
    return context;
}

export function TableUpdateProvider({children}: { children: React.ReactNode }) {
    const wsRef = useRef<WebSocket | null>(null);
    const queryClient = useQueryClient();
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<UpdateMessage | null>(null);
    const pendingUpdatesRef = useRef<Map<string, PendingUpdate>>(new Map());
    const [, forceUpdate] = useState({});

    const ROLLBACK_TIMEOUT = 5000;

    useEffect(() => {
        const backend = process.env.NEXT_PUBLIC_BACKEND_ORIGIN!;
        const wsUrl = backend.replace(/^http/, 'ws') + '/ws';

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('✅ WebSocket connected');
            setIsConnected(true);
        };

        ws.onclose = () => {
            console.log('❌ WebSocket disconnected');
            setIsConnected(false);
        };

        ws.onerror = (err) => {
            console.error('WebSocket error:', err);
            setIsConnected(false);
        };

        ws.onmessage = (event) => {
            try {
                const msg: UpdateMessage = JSON.parse(event.data);
                console.log('📨 WS incoming:', msg);

                if (msg.type === 'FIELD_UPDATED') {
                    const recordId = msg.payload.record?.id ?? msg.payload.id;
                    const field = msg.payload.field;
                    const key = `${recordId}-${field}`;

                    if (pendingUpdatesRef.current.has(key)) {
                        console.log('✅ Server confirmed update:', key);
                        pendingUpdatesRef.current.delete(key);
                        forceUpdate({});
                    }
                }

                setLastMessage(msg);
            } catch (e) {
                console.error('WS parse error:', e);
            }
        };

        return () => {
            ws.close();
            pendingUpdatesRef.current.clear();
        };
    }, []);

    const rollbackUpdate = useCallback((key: string, pendingUpdate: PendingUpdate) => {
        console.warn('⏪ Rolling back update:', key);

        if (pendingUpdate.previousData) {
            queryClient.setQueryData(['tableData'], pendingUpdate.previousData);
        }

        pendingUpdatesRef.current.delete(key);
        forceUpdate({});
    }, [queryClient]);

    const sendUpdate = useCallback((id: number, field: string, value: any) => {
        const key = `${id}-${field}`;

        const previousData = queryClient.getQueryData<InfiniteData<IRecord[]>>(['tableData']);

        queryClient.setQueryData<InfiniteData<IRecord[]>>(['tableData'], (oldData) => {
            if (!oldData) return oldData;

            const newPages = oldData.pages.map(page =>
                page.map(record =>
                    record.id === id
                        ? {...record, [field]: value, updated_at: new Date()}
                        : record
                )
            );

            return {...oldData, pages: newPages};
        });

        console.log('⚡ Optimistic update applied:', {id, field, value});

        const pendingUpdate: PendingUpdate = {
            id,
            field,
            value,
            timestamp: Date.now(),
            previousData
        };
        pendingUpdatesRef.current.set(key, pendingUpdate);
        forceUpdate({});

        const ws = wsRef.current;

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error('❌ WebSocket not connected, rolling back...');
            setTimeout(() => rollbackUpdate(key, pendingUpdate), 100);
            return;
        }

        ws.send(JSON.stringify({
            type: 'FIELD_UPDATE',
            payload: {recordId: id, field, value}
        }));

        setTimeout(() => {
            if (pendingUpdatesRef.current.has(key)) {
                console.warn('⏱️ Server response timeout, rolling back:', key);
                rollbackUpdate(key, pendingUpdate);
            }
        }, ROLLBACK_TIMEOUT);

    }, [queryClient, rollbackUpdate]);

    return (
        <TableUpdateContext.Provider value={{
            sendUpdate,
            isConnected,
            lastMessage,
            pendingUpdates: pendingUpdatesRef.current
        }}>
            {children}
        </TableUpdateContext.Provider>
    );
}