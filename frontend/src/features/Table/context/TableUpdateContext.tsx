import React, { createContext, useContext, useRef, useCallback } from 'react';

interface UpdateMessage {
    type: string;
    id: number;
    field: string;
    value: any;
    timestamp: number;
}

interface TableUpdateContextValue {
    sendUpdate: (id: number, field: string, value: any) => void;
}

const TableUpdateContext = createContext<TableUpdateContextValue | null>(null);

export function useTableUpdate() {
    const context = useContext(TableUpdateContext);
    if (!context) {
        throw new Error('useTableUpdate must be used within TableUpdateProvider');
    }
    return context;
}

interface TableUpdateProviderProps {
    children: React.ReactNode;
}

export function TableUpdateProvider({ children }: TableUpdateProviderProps) {
    const wsRef = useRef<WebSocket | null>(null);

    // Ініціалізація WebSocket
    React.useEffect(() => {
        if (typeof window === "undefined") return;

        const backend = process.env.NEXT_PUBLIC_BACKEND_ORIGIN!;
        const wsUrl = backend.replace(/^http/, "ws") + "/ws";

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => console.log("WS Connected");
        ws.onclose = () => console.log("WS Disconnected");
        ws.onerror = (err) => console.error("WS Error:", err);

        return () => {
            ws.close();
        };
    }, []);

    // Стабільна функція відправки
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
        console.log("Відправлено:", message);
    }, []);

    return (
        <TableUpdateContext.Provider value={{ sendUpdate }}>
            {children}
        </TableUpdateContext.Provider>
    );
}