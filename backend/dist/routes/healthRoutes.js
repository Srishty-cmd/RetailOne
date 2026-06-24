"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const redis_1 = require("../config/redis");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const mongodbStatus = mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected';
        let redisStatus = 'disconnected';
        if (redis_1.redisClient && redis_1.redisClient.isOpen) {
            try {
                await redis_1.redisClient.ping();
                redisStatus = 'connected';
            }
            catch (err) {
                console.error('Redis health check ping failed:', err);
            }
        }
        if (mongodbStatus === 'connected' && redisStatus === 'connected') {
            return res.status(200).json({
                status: 'success',
                mongodb: mongodbStatus,
                redis: redisStatus
            });
        }
        else {
            return res.status(500).json({
                status: 'error',
                mongodb: mongodbStatus,
                redis: redisStatus
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            mongodb: 'disconnected',
            redis: 'disconnected',
            message: error.message
        });
    }
});
exports.default = router;
