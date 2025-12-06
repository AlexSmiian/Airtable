import React, { createContext, useContext, useRef, useCallback, useState } from 'react';

interface UpdateMessage {
    type: string;
    id: number;
    field: string;
    value: any;
    timestamp: number;
}

interface TableUpdateContextValue {
    sendUpdate: (id: number, field: string, value: any) => void;
    isConnected: boolean;
}

const TableUpdateContext = createContext<TableUpdateContextValue | null>(null);

export function useTableUpdate() {
    const context = useContext(TableUpdateContext);
    if (!context) {
        throw new Error('useTableUpdate must be used within TableUpdateProvider');
    }
    return context;
}

export function useTableUpdateStatus() {
    const context = useContext(TableUpdateContext);
    if (!context) {
        throw new Error('useTableUpdateStatus must be used within TableUpdateProvider');
    }
    return { isConnected: context.isConnected };
}

interface TableUpdateProviderProps {
    children: React.ReactNode;
}

export function TableUpdateProvider({ children }: TableUpdateProviderProps) {
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Ініціалізація WebSocket один раз
    React.useEffect(() => {
        if (typeof window === "undefined") return;

        const backend = process.env.NEXT_PUBLIC_BACKEND_ORIGIN!;
        const wsUrl = backend.replace(/^http/, "ws") + "/ws";

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket Connected");
            setIsConnected(true);
        };
        ws.onclose = () => {
            console.log("WebSocket Disconnected");
            setIsConnected(false);
        };
        ws.onerror = (err) => {
            console.error("WebSocket Error:", err);
            setIsConnected(false);
        };
        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                console.log("Отримано з WS:", msg);
            } catch (e) {
                console.error("WS parse error:", e);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    // Стабільна функція відправки без залежностей
    const sendUpdate = useCallback((id: number, field: string, value: any) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("WebSocket не підключено");
            return;
        }

        const message: UpdateMessage = {
            type: "update",
            id,
            field,
            value,
            timestamp: Date.now()
        };

        ws.send(JSON.stringify(message));
        console.log("Відправлено через WS:", message);
    }, []); // ВАЖЛИВО: порожній масив залежностей

    return (
        <TableUpdateContext.Provider value={{ sendUpdate, isConnected }}>
            {children}
        </TableUpdateContext.Provider>
    );
}