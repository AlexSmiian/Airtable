import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
    type: string;
    [key: string]: any;
}

export function useWebSocket(url: string) {
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<WebSocketMessage[]>([]);

    // Ініціалізація WebSocket
    useEffect(() => {
        if (typeof window === "undefined") return;

        const backend = process.env.NEXT_PUBLIC_BACKEND_ORIGIN!;
        const wsUrl = backend.replace(/^http/, "ws") + "/ws";

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        const handleOpen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);
        };

        const handleClose = () => {
            console.log("WebSocket disconnected");
            setIsConnected(false);
        };

        const handleMessage = (event: MessageEvent) => {
            try {
                const msg = JSON.parse(event.data);
                setMessages(prev => [...prev, msg]);
            } catch (e) {
                console.error("WS parse error:", e);
            }
        };

        const handleError = (error: Event) => {
            console.error("WebSocket error:", error);
        };

        ws.addEventListener("open", handleOpen);
        ws.addEventListener("close", handleClose);
        ws.addEventListener("message", handleMessage);
        ws.addEventListener("error", handleError);

        return () => {
            ws.removeEventListener("open", handleOpen);
            ws.removeEventListener("close", handleClose);
            ws.removeEventListener("message", handleMessage);
            ws.removeEventListener("error", handleError);
            ws.close();
        };
    }, []); // Порожній масив - створюємо WebSocket тільки один раз

    // Стабільна функція для відправки повідомлень
    const sendMessage = useCallback((message: WebSocketMessage) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("WebSocket не підключено");
            return false;
        }

        try {
            ws.send(JSON.stringify(message));
            console.log("Відправлено через WS:", message);
            return true;
        } catch (error) {
            console.error("Помилка відправки:", error);
            return false;
        }
    }, []); // Без залежностей - функція стабільна

    return {
        isConnected,
        messages,
        sendMessage,
    };
}