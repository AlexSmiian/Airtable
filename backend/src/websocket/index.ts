import { Server as HttpServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { redisSubscriber } from '../redis/index.ts';
import { WSMessageType } from '../types/index.js';
import {handleFieldUpdate} from "./handleFieldUpdate.ts";

const clients = new Set<WebSocket>();
const REDIS_CHANNEL = 'table_updates';
let isRedisSubscribed = false;

export function setupWebSocket(server: HttpServer) {
    const wss = new WebSocketServer({ server, path: '/ws' });

    subscribeRedis();

    setInterval(() => {
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) client.ping();
        });
    }, 3000);

    wss.on('connection', (ws: WebSocket) => {
        clients.add(ws);
        console.log(`🔌 New client connected. Total: ${clients.size}`);

        ws.on('message', async (data: WebSocket.RawData) => {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.type === WSMessageType.FIELD_UPDATE) {
                    await handleFieldUpdate(msg.payload); // публікує в Redis
                }
            } catch (err) {
                console.error('WS error:', err);
                ws.send(JSON.stringify({
                    type: WSMessageType.RECORD_UPDATE_ERROR,
                    payload: { error: err instanceof Error ? err.message : 'Update failed' }
                }));
            }
        });


        ws.on('close', () => {
            clients.delete(ws);
            console.log(`❌ Client disconnected. Total: ${clients.size}`);
        });
    });

    console.log(`✅ WebSocket server initialized on /ws`);
}

function broadcastToClients(message: any) {
    const str = JSON.stringify(message);
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(str);
        }
    });
}

async function subscribeRedis() {
    if (isRedisSubscribed) return;

    await redisSubscriber.subscribe(REDIS_CHANNEL, (message: string) => {
        try {
            const wsMessage = JSON.parse(message);
            // Розсилаємо всім локальним клієнтам на цьому інстансі
            broadcastToClients(wsMessage);
        } catch (err) {
            console.error('Redis parse error:', err);
        }
    });

    isRedisSubscribed = true;
    console.log(`✅ Subscribed to Redis channel: ${REDIS_CHANNEL}`);
}
