const socket = io();

const messagesList = document.getElementById('messages');
const messageForm = document.getElementById('messageForm');
const inputName = document.getElementById('name');
const messageReceiveStatus = document.getElementById('messageReceiveStatus');

inputName.value = prompt('Представьтесь, пожалуйста!');

messageForm.addEventListener('submit', e => {
    e.preventDefault();
    e.stopPropagation();

    const { name, message } = e.target.elements;

    socket.emit('chatMessageSend', name.value, message.value);
    message.value = '';
});

socket.on('chatMessageReceived', () => {
    // Обновление статуса доставки последнего сообщение
    messageReceiveStatus.checked = true;
});

socket.on('chatMessageAdd', (timeString, name, message) => {
    const time = new Date(timeString);

    const messageItem = document.createElement('li');
    messageItem.innerHTML = `
        <p class="time">${time.toLocaleDateString()} ${time.toLocaleTimeString()}</p>
        <p class="username">${name}</p>
        <p class="usermessage">${message}</p>
    `;
    messagesList.append(messageItem);

    // Сброс статуса доставки последнего сообщение
    messageReceiveStatus.checked = false;
});