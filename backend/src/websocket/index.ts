// websocket/index.ts
import { Server as HttpServer } from "http";
import WebSocket, { WebSocketServer } from "ws";

export function setupWebSocket(server: HttpServer) {
    // WebSocket на шляху /ws
    const wss = new WebSocketServer({
        server,
        path: '/ws'
    });

    wss.on("connection", (ws: WebSocket) => {
        console.log("New client connected");

        ws.send(JSON.stringify({ message: "Welcome to WebSocket server!" }));

        ws.on("message", (data: WebSocket.RawData) => {
            try {
                const parsed = JSON.parse(data.toString());
                console.log("Received message:", parsed);
                ws.send(JSON.stringify({ message: "Message received", data: parsed }));
            } catch (err) {
                console.error("Error parsing message:", err);
            }
        });

        ws.on("close", () => {
            console.log("Client disconnected");
        });

        ws.on("error", (err) => {
            console.error("WebSocket error:", err);
        });
    });

    console.log("WebSocket server initialized on /ws");
}