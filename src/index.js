import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.js'
import postRoutes from './routes/post.js'
import commentRoutes from './routes/comment.js'
import userRouter from './routes/user.js'
import { connectDB } from './utils/db.utils.js'

const app = express()

const PORT = process.env.PORT || 8080

connectDB()
// "https://pinterest-clone-tau.vercel.app"
app.use(cors({
    origin: 'https://pinterest-clone-tau.vercel.app',
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
// Removed morgan middleware
app.use('/auth', authRoutes)
app.use('/post', postRoutes)
app.use('/comment', commentRoutes)
app.use('/user', userRouter)

app.get('/', (req, res) =>{
    res.send(`Server is running on port ${PORT}`)
})

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

app.listen(PORT, () => {
    console.log(`Server version 1.1 running on port ${PORT}`)
})