let ws: WebSocket | null = null;

export function getWs() {
    if (typeof window === "undefined") return null;

    if (!ws || ws.readyState === WebSocket.CLOSED) {
        const backend = process.env.NEXT_PUBLIC_BACKEND_ORIGIN!;
        const wsUrl = backend.replace(/^http/, "ws") + "/ws";

        ws = new WebSocket(wsUrl);
    }

    return ws;
}
