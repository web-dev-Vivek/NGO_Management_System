import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import path from 'path';
import { fileURLToPath } from 'url';
import errorHandler from './middleware/errorHandler.js';

// Route files
import userRoutes from './modules/users/users.routes.js';

// Recreate __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Clerk authentication middleware
app.use(clerkMiddleware());

// Mount routers
app.use('/api/users', userRoutes);

// Base route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the NGO Management System API'
    });
});

// Centralized error handling
app.use(errorHandler);

export default app;
