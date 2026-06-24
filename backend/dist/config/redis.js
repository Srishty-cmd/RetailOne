"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redisClient = void 0;
const redis_1 = require("redis");
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
exports.redisClient = (0, redis_1.createClient)({
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
exports.redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});
const connectRedis = async () => {
    try {
        await exports.redisClient.connect();
        console.log('Redis Connected Successfully');
    }
    catch (error) {
        console.error(`Redis Connection Error: ${error.message}. Continuing server startup without Redis.`);
    }
};
exports.connectRedis = connectRedis;
