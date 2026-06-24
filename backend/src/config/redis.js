const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
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

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis Connected Successfully');
  } catch (error) {
    console.error(`Redis Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  redisClient,
  connectRedis
};
