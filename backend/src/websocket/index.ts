import { Server as HttpServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { RecordService } from '../services/recordService.js';
import { WSMessage, WSMessageType, FieldUpdatePayload } from '../types/index.js';

const clients = new Set<WebSocket>();

export function setupWebSocket(server: HttpServer) {
    const wss = new WebSocketServer({ server, path: '/ws' });

    wss.on('connection', (ws: WebSocket) => {
        console.log('🔌 New client connected. Total:', clients.size + 1);
        clients.add(ws);

        ws.send(JSON.stringify({
            type: WSMessageType.CONNECTED,
            payload: { message: 'Connected to WebSocket', clients: clients.size }
        }));

        ws.on('message', async (data: WebSocket.RawData) => {
            try {
                const message: WSMessage = JSON.parse(data.toString());

                if (message.type === WSMessageType.FIELD_UPDATE) {
                    await handleFieldUpdate(ws, message.payload);
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
            console.log('❌ Client disconnected. Total:', clients.size);
        });

        ws.on('error', (err) => {
            console.error('WebSocket error:', err);
            clients.delete(ws);
        });
    });

    console.log('✅ WebSocket server initialized on /ws');
}

async function handleFieldUpdate(ws: WebSocket, payload: FieldUpdatePayload) {
    try {
        const { recordId, field, value } = payload;
        const updatedRecord = await RecordService.updateRecordField(recordId, field, value);

        broadcastToAll({
            type: WSMessageType.FIELD_UPDATED,
            payload: { record: updatedRecord, field, value }
        });
    } catch (error) {
        ws.send(JSON.stringify({
            type: WSMessageType.RECORD_UPDATE_ERROR,
            payload: { error: error instanceof Error ? error.message : 'Update failed' }
        }));
    }
}

function broadcastToAll(message: WSMessage) {
    const messageStr = JSON.stringify(message);
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}