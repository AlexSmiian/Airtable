import { Server as HttpServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { RecordService } from '../services/recordService.js';
import { WSMessage, WSMessageType, FieldUpdatePayload } from '../types/index.js';
import { PORT } from '../config.js';
import {redisClient, redisSubscriber} from "../redis/index.ts";

const clients = new Set<WebSocket>();
const REDIS_CHANNEL = 'table_updates';

let isRedisSubscribed = false;

export function setupWebSocket(server: HttpServer) {
    const wss = new WebSocketServer({ server, path: '/ws' });

    setupRedisSubscription();

    wss.on('connection', (ws: WebSocket) => {
        console.log(`🔌 [Server ${PORT}] New client connected. Total: ${clients.size + 1}`);
        clients.add(ws);

        ws.send(JSON.stringify({
            type: WSMessageType.CONNECTED,
            payload: {
                message: 'Connected to WebSocket',
                server: PORT,
                clients: clients.size
            }
        }));

        ws.on('message', async (data: WebSocket.RawData) => {
            try {
                const message: WSMessage = JSON.parse(data.toString());

                if (message.type === WSMessageType.FIELD_UPDATE) {
                    await handleFieldUpdate(message.payload);
                }
            } catch (err) {
                console.error('WebSocket error:', err);
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    payload: { error: 'Invalid message' }
                }));
            }
        });

        ws.on('close', () => {
            clients.delete(ws);
            console.log(`❌ [Server ${PORT}] Client disconnected. Total: ${clients.size}`);
        });

        ws.on('error', (err) => {
            console.error('WebSocket error:', err);
            clients.delete(ws);
        });
    });

    console.log(`✅ [Server ${PORT}] WebSocket server initialized on /ws`);
}

async function setupRedisSubscription() {
    if (isRedisSubscribed) return;

    try {
        await redisSubscriber.subscribe(REDIS_CHANNEL, (message: any) => {
            try {
                const wsMessage: WSMessage = JSON.parse(message);

                broadcastToLocalClients(wsMessage);

                console.log(`📡 [Server ${PORT}] Received from Redis, broadcasted to ${clients.size} local clients`);
            } catch (err) {
                console.error('Error processing Redis message:', err);
            }
        });

        isRedisSubscribed = true;
        console.log(`✅ [Server ${PORT}] Subscribed to Redis channel: ${REDIS_CHANNEL}`);
    } catch (err) {
        console.error('Failed to subscribe to Redis:', err);
    }
}

async function handleFieldUpdate(payload: FieldUpdatePayload) {
    try {
        const { recordId, field, value } = payload;

        const updatedRecord = await RecordService.updateRecordField(recordId, field, value);

        const message: WSMessage = {
            type: WSMessageType.FIELD_UPDATED,
            payload: { record: updatedRecord, field, value }
        };

        await redisClient.publish(REDIS_CHANNEL, JSON.stringify(message));

        console.log(`📤 [Server ${PORT}] Published update to Redis for record ${recordId}`);
    } catch (error) {
        console.error('Error updating field:', error);

        broadcastToLocalClients({
            type: WSMessageType.RECORD_UPDATE_ERROR,
            payload: { error: error instanceof Error ? error.message : 'Update failed' }
        });
    }
}

function broadcastToLocalClients(message: WSMessage) {
    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
            sentCount++;
        }
    });

    if (sentCount > 0) {
        console.log(`📡 [Server ${PORT}] Broadcasted to ${sentCount} local clients`);
    }
}

export function getWebSocketStats() {
    return {
        server: PORT,
        connectedClients: clients.size,
        redisSubscribed: isRedisSubscribed
    };
}