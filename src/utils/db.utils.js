import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) return mongoose.connection;
        if (!process.env.DB_URI) {
            throw new Error('Database URI is not defined in environment variables');
        }
        
        const options = { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000, maxPoolSize: 10 };

        await mongoose.connect(process.env.DB_URI, options);
        console.log('Connected to DB');
        
        mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
};
