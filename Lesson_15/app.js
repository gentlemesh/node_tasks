import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: `localhost:${PORT}` },
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

io.on('connection', socket => {
    console.log(`Подключился новый пользователь с id ${socket.id}`);

    // Обработка входящего сообщения от пользователя
    socket.on('chatMessageSend', (name, msg) => {
        console.log(`Сообщение от пользователя «${name}» [id: ${socket.id}]: ${msg}`);

        // Уведомление о доставке автору сообщения
        socket.emit('chatMessageReceived');

        // Отправка сообщения в общий чат с имитацией задержки от сервера
        setTimeout(() => {
            io.emit('chatMessageAdd', new Date().toISOString(), name, msg);
        }, 2000);
    });


    socket.on('disconnect', () => {
        console.log(`Отключился пользователь с id ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});