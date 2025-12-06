// backend/src/server.ts
import { createServer } from 'http';
import app from './app.js';
import { setupWebSocket } from './websocket/index.js';
import { checkConnection } from './db/pool.js';
import { PORT } from './config.js';

const httpServer = createServer(app);

// Ініціалізація WebSocket
setupWebSocket(httpServer);

// Запуск сервера
async function startServer() {
    try {
        // Перевіряємо підключення до БД
        const dbConnected = await checkConnection();

        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Exiting...');
            process.exit(1);
        }

        // Запускаємо HTTP сервер
        httpServer.listen(PORT, () => {
            console.log(`
🚀 Server started successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 HTTP Server:  http://localhost:${PORT}
🔌 WebSocket:    ws://localhost:${PORT}/ws
📊 API Health:   http://localhost:${PORT}/api/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

startServer();