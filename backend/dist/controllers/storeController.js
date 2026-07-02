"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStore = exports.getStores = void 0;
const Store_1 = __importDefault(require("../models/Store"));
// @desc    Get all stores
// @route   GET /api/stores
// @access  Private
const getStores = async (req, res, next) => {
    try {
        const stores = await Store_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: stores.length,
            data: stores
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStores = getStores;
// @desc    Create new store
// @route   POST /api/stores
// @access  Private (Admin)
const createStore = async (req, res, next) => {
    try {
        const { name, code, address, phone } = req.body;
        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: 'Store name and code are required'
            });
        }
        const storeExists = await Store_1.default.findOne({ code: code.toUpperCase() });
        if (storeExists) {
            return res.status(400).json({
                success: false,
                message: 'Store with this code already exists'
            });
        }
        const store = await Store_1.default.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.createStore = createStore;
