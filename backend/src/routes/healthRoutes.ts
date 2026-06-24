import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { redisClient } from '../config/redis';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const mongodbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    let redisStatus = 'disconnected';
    if (redisClient && redisClient.isOpen) {
      try {
        await redisClient.ping();
        redisStatus = 'connected';
      } catch (err) {
        console.error('Redis health check ping failed:', err);
      }
    }

    if (mongodbStatus === 'connected' && redisStatus === 'connected') {
      return res.status(200).json({
        status: 'success',
        mongodb: mongodbStatus,
        redis: redisStatus
      });
    } else {
      return res.status(500).json({
        status: 'error',
        mongodb: mongodbStatus,
        redis: redisStatus
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      mongodb: 'disconnected',
      redis: 'disconnected',
      message: error.message
    });
  }
});

export default router;
