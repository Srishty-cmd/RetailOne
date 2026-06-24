import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      // Limit retries to 3 so that server startup fails fast if Redis is down
      if (retries > 3) {
        return new Error('Redis connection failed: Max retries exceeded');
      }
      return 1000; // Retry after 1 second
    }
  }
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('Redis Connected Successfully');
  } catch (error: any) {
    console.error(`Redis Connection Error: ${error.message}. Continuing server startup without Redis.`);
  }
};
