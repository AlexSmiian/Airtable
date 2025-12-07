"use client";

import React, {createContext, useContext, useRef, useCallback, useState, useEffect} from 'react';

interface UpdateMessage {
    type: string;
    payload: any;
}

interface TableUpdateContextValue {
    sendUpdate: (id: number , field: string, value: any) => void;
    isConnected: boolean;
    lastMessage: UpdateMessage | null;
}

const TableUpdateContext = createContext<TableUpdateContextValue | null>(null);

export function useTableUpdate() {
    const context = useContext(TableUpdateContext);
    if (!context) throw new Error('useTableUpdate must be used within TableUpdateProvider');
    return context;
}

export function TableUpdateProvider({ children }: { children: React.ReactNode }) {
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<UpdateMessage | null>(null);

    useEffect(() => {
        const backend = process.env.NEXT_PUBLIC_BACKEND_ORIGIN!;
        const wsUrl = backend.replace(/^http/, 'ws') + '/ws';

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => setIsConnected(true);
        ws.onclose = () => setIsConnected(false);
        ws.onerror = (err) => {
            console.error('WebSocket error:', err);
            setIsConnected(false);
        };
        ws.onmessage = (event) => {
            try {
                const msg: UpdateMessage = JSON.parse(event.data);
                console.log('WS incoming:', msg);
                setLastMessage(msg);
            } catch (e) {
                console.error('WS parse error:', e);
            }
        };

        return () => ws.close();
    }, []);

    const sendUpdate = useCallback((id: number, field: string, value: any) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        ws.send(JSON.stringify({
            type: 'FIELD_UPDATE',
            payload: { recordId: id, field, value }
        }));
    }, []);

    return (
        <TableUpdateContext.Provider value={{ sendUpdate, isConnected, lastMessage }}>
            {children}
        </TableUpdateContext.Provider>
    );
}
