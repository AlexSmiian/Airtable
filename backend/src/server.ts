import { createServer } from "http";
import app from "./app.ts";
import {setupWebSocket} from "./websocket/index.ts";

const PORT = process.env.PORT || 5000;
//
const httpServer = createServer(app);
//
// // Підключаємо WebSocket до того ж HTTP-сервера
setupWebSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
