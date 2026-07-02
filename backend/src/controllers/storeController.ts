import { Response, NextFunction } from 'express';
import { AuthRequest } from './authController';
import Store from '../models/Store';

// @desc    Get all stores
// @route   GET /api/stores
// @access  Private
export const getStores = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const stores = await Store.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new store
// @route   POST /api/stores
// @access  Private (Admin)
export const createStore = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { name, code, address, phone } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Store name and code are required'
      });
    }

    const storeExists = await Store.findOne({ code: code.toUpperCase() });
    if (storeExists) {
      return res.status(400).json({
        success: false,
        message: 'Store with this code already exists'
      });
    }

    const store = await Store.create({
      name,
      code: code.toUpperCase(),
      address,
      phone,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: store
    });
  } catch (error) {
    next(error);
  }
};
