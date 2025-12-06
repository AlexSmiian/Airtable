import { createServer } from 'http';
import app from './app.js';
import { setupWebSocket } from './websocket/index.js';
import { checkConnection } from './db/pool.js';
import { PORT } from './config.js';
import {connectRedis, disconnectRedis} from "./redis/index.ts";

const httpServer = createServer(app);

setupWebSocket(httpServer);

async function startServer() {
    try {
        const dbConnected = await checkConnection();
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Exiting...');
            process.exit(1);
        }

        const redisConnected = await connectRedis();
        if (!redisConnected) {
            console.error('⚠️  Warning: Redis not connected. Multi-server sync disabled.');
        }

        // Запускаємо HTTP сервер
        httpServer.listen(PORT, () => {
            console.log(`
🚀 Server started successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 HTTP Server:  http://localhost:${PORT}
🔌 WebSocket:    ws://localhost:${PORT}/ws
📊 API Health:   http://localhost:${PORT}/api/health
${redisConnected ? '🔴 Redis:        Connected (Multi-server sync enabled)' : '⚠️  Redis:        Disconnected'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

const shutdown = async () => {
    console.log('\n🛑 Shutting down gracefully...');

    await disconnectRedis();

    httpServer.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('❌ Forced shutdown');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();