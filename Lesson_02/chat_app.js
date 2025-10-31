// Чат-приложение
// 1.Создайте новый файл с именем `chat_app.js`.
// 1.Импортируйте модуль `events` и создайте экземпляр `EventEmitter`.
// 1.Напишите функцию `sendMessage`, которая принимает имя пользователя, сообщение и объект `EventEmitter`.
// 1.Внутри функции `sendMessage` генерируйте событие `message` с именем пользователя и сообщением.
// 1.Зарегистрируйте обработчик для события `message`, чтобы выводить сообщение в формате "User: Message".
// 1.Вызовите функцию `sendMessage` несколько раз с разными пользователями и сообщениями.

const EventEmitter = require('events');
const chatEmitter = new EventEmitter();

const sendMessage = (userName, message, emitter = chatEmitter) => {
    emitter.emit('message', userName, message);
}

chatEmitter.on('message', (userName, message) => {
    const now = new Date();
    const datetimeString = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    console.log(`[${datetimeString}] ${userName}: ${message}`);
});

sendMessage('Иван', 'Привет');
sendMessage('Ваня', 'Привет всем');
sendMessage('Aня', 'Привет!');
sendMessage('Витя', 'Где я?', chatEmitter || new EventEmitter);