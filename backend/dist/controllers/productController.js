"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
// @desc    Get all products (with pagination, filtering, search)
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
    try {
        const { search, category, status } = req.query;
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const query = {};
        if (search) {
            query.$or = [
                { productName: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { barcode: { $regex: search, $options: 'i' } }
            ];
        }
        if (category && category !== 'All') {
            query.category = category;
        }
        if (status && status !== 'All') {
            query.status = status;
        }
        const total = await Product_1.default.countDocuments(query);
        const products = await Product_1.default.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            success: true,
            count: products.length,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: products
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res, next) => {
    try {
        const product = await Product_1.default.findById(req.params.id).populate('createdBy', 'name email');
        if (!product) {
            return res.status(404).json({
                success: false,
                message: `Product not found with id of ${req.params.id}`
            });
        }
        res.status(200).json({
            success: true,
            data: product
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductById = getProductById;
// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin, Inventory Manager)
const createProduct = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }
        req.body.createdBy = req.user.userId;
        // Check SKU uniqueness manually to return a nice message
        const { sku } = req.body;
        if (sku) {
            const existingProduct = await Product_1.default.findOne({ sku: sku.toUpperCase() });
            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: `Product with SKU '${sku}' already exists`
                });
            }
        }
        const product = await Product_1.default.create(req.body);
        res.status(201).json({
            success: true,
            data: product
        });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        next(error);
    }
};
exports.createProduct = createProduct;
// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin, Inventory Manager)
const updateProduct = async (req, res, next) => {
    try {
        let product = await Product_1.default.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: `Product not found with id of ${req.params.id}`
            });
        }
        // Check SKU uniqueness manually if SKU is being updated
        const { sku } = req.body;
        if (sku && sku.toUpperCase() !== product.sku) {
            const existingProduct = await Product_1.default.findOne({ sku: sku.toUpperCase() });
            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: `Product with SKU '${sku}' already exists`
                });
            }
        }
        product = await Product_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: product
        });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        next(error);
    }
};
exports.updateProduct = updateProduct;
// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: `Product not found with id of ${req.params.id}`
            });
        }
        await Product_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
