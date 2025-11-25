import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGO_URL);

let dbConnection;

async function connectDB() {
    try {
        await client.connect();
        console.log('Соединение с MongoDB Server установлено');

        dbConnection = client.db(); // экземпляр базы данных
    } catch (error) {
        console.error('Не удалось подключиться к MongoDB Server', error.message);
        throw error;
    }
}

function getDB() {
    if (!dbConnection) {
        throw new Error('Не удалось подключиться к базе данных');
    }

    return dbConnection;
}

export { connectDB, getDB };