const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { redisClient } = require('../config/redis');

router.get('/', async (req, res) => {
  try {
    // Check MongoDB connection status: 1 = connected
    const mongodbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Check Redis connection status
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
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      mongodb: 'disconnected',
      redis: 'disconnected',
      message: error.message
    });
  }
});

module.exports = router;
