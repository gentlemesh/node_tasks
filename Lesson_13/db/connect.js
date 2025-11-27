import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('MongoDB успешно подключена!');
    } catch (error) {
        console.error('Ошибка подключения к MongoDB: ', error.message);
        process.exit(1);
    }
}

export default connectDB;