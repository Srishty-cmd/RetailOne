import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import { connectRedis } from './config/redis';
import authRoutes from './routes/authRoutes';
import healthRoutes from './routes/healthRoutes';
import productRoutes from './routes/productRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import orderRoutes from './routes/orderRoutes';
import storeRoutes from './routes/storeRoutes';
import posRoutes from './routes/posRoutes';
import reportRoutes from './routes/reportRoutes';
import userRoutes from './routes/userRoutes';
import { loggerMiddleware } from './middleware/loggerMiddleware';
import { securityMiddleware } from './middleware/securityMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';
import { seedDatabase } from './scripts/seed';

const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(loggerMiddleware);
app.use(securityMiddleware); // Helmet and CORS configured for credentials

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Root Endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('RetailOne API is running (TypeScript)...');
});

// Global Error Handler
app.use(errorMiddleware as any);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect MongoDB
    await connectDB();

    // Auto-seed database (Store and Accounts) if needed
    await seedDatabase();

    // Connect Redis (enabled for containers)
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
