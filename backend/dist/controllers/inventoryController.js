"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryHistory = exports.stockOut = exports.stockIn = exports.deleteInventoryItem = exports.updateInventoryItem = exports.createInventoryItem = exports.getInventoryItemById = exports.getInventoryItems = void 0;
const Inventory_1 = __importDefault(require("../models/Inventory"));
const InventoryLog_1 = __importDefault(require("../models/InventoryLog"));
const Product_1 = __importDefault(require("../models/Product"));
// @desc    Get all inventory items (with pagination, filtering, search)
// @route   GET /api/inventory
// @access  Private
const getInventoryItems = async (req, res, next) => {
    try {
        const { search, category, status } = req.query;
        // Self-healing: Ensure all products have a corresponding inventory record
        if (req.user) {
            const allProducts = await Product_1.default.find().select('_id quantity minimumStock createdBy');
            for (const prod of allProducts) {
                const exists = await Inventory_1.default.findOne({ product: prod._id });
                if (!exists) {
                    await Inventory_1.default.create({
                        product: prod._id,
                        currentStock: prod.quantity || 0,
                        minimumStock: prod.minimumStock || 0,
                        maximumStock: (prod.quantity && prod.quantity > 500) ? prod.quantity * 2 : 500,
                        reorderLevel: prod.minimumStock || 5,
                        warehouseLocation: 'Main Warehouse',
                        createdBy: req.user.userId || prod.createdBy
                    });
                }
            }
        }
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Build product-level query
        const productQuery = {};
        if (search) {
            productQuery.$or = [
                { productName: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } }
            ];
        }
        if (category && category !== 'All') {
            productQuery.category = category;
        }
        // Retrieve matching product IDs
        const matchedProducts = await Product_1.default.find(productQuery).select('_id');
        const productIds = matchedProducts.map(p => p._id);
        // Build inventory-level query
        const query = { product: { $in: productIds } };
        if (status && status !== 'All') {
            query.status = status;
        }
        const total = await Inventory_1.default.countDocuments(query);
        const inventoryItems = await Inventory_1.default.find(query)
            .populate('product', 'productName sku category sellingPrice costPrice image brand minimumStock quantity')
            .populate('createdBy', 'name email')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit);
        // Calculate global stats
        const totalCount = await Inventory_1.default.countDocuments();
        const inStockCount = await Inventory_1.default.countDocuments({ status: 'In Stock' });
        const lowStockCount = await Inventory_1.default.countDocuments({ status: 'Low Stock' });
        const outOfStockCount = await Inventory_1.default.countDocuments({ status: 'Out of Stock' });
        res.status(200).json({
            success: true,
            count: inventoryItems.length,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            summary: {
                total: totalCount,
                inStock: inStockCount,
                lowStock: lowStockCount,
                outOfStock: outOfStockCount
            },
            data: inventoryItems
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventoryItems = getInventoryItems;
// @desc    Get single inventory item by ID
// @route   GET /api/inventory/:id
// @access  Private
const getInventoryItemById = async (req, res, next) => {
    try {
        const item = await Inventory_1.default.findById(req.params.id)
            .populate('product', 'productName sku category sellingPrice costPrice image brand minimumStock quantity')
            .populate('createdBy', 'name email');
        if (!item) {
            return res.status(404).json({
                success: false,
                message: `Inventory item not found with id of ${req.params.id}`
            });
        }
        res.status(200).json({
            success: true,
            data: item
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventoryItemById = getInventoryItemById;
// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private (Admin, Inventory Manager)
const createInventoryItem = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }
        const { product, currentStock, minimumStock, maximumStock, reorderLevel, warehouseLocation } = req.body;
        // Check if inventory for product already exists
        const existingInventory = await Inventory_1.default.findOne({ product });
        if (existingInventory) {
            return res.status(400).json({
                success: false,
                message: 'Inventory record for this product already exists'
            });
        }
        // Verify product exists
        const matchedProduct = await Product_1.default.findById(product);
        if (!matchedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        const newItem = await Inventory_1.default.create({
            product,
            currentStock: currentStock || 0,
            minimumStock: minimumStock || 0,
            maximumStock: maximumStock || 0,
            reorderLevel: reorderLevel || 0,
            warehouseLocation,
            createdBy: req.user.userId
        });
        // Synchronize currentStock and minimumStock with the Product
        await Product_1.default.findByIdAndUpdate(product, {
            quantity: newItem.currentStock,
            minimumStock: newItem.minimumStock
        });
        res.status(201).json({
            success: true,
            data: newItem
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
exports.createInventoryItem = createInventoryItem;
// @desc    Update inventory item details
// @route   PUT /api/inventory/:id
// @access  Private (Admin, Inventory Manager)
const updateInventoryItem = async (req, res, next) => {
    try {
        const { currentStock, minimumStock, maximumStock, reorderLevel, warehouseLocation } = req.body;
        let item = await Inventory_1.default.findById(req.params.id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: `Inventory item not found with id of ${req.params.id}`
            });
        }
        // Apply updates manually to trigger schema pre-save hooks
        if (currentStock !== undefined)
            item.currentStock = currentStock;
        if (minimumStock !== undefined)
            item.minimumStock = minimumStock;
        if (maximumStock !== undefined)
            item.maximumStock = maximumStock;
        if (reorderLevel !== undefined)
            item.reorderLevel = reorderLevel;
        if (warehouseLocation !== undefined)
            item.warehouseLocation = warehouseLocation;
        await item.save();
        // Synchronize quantities with corresponding Product
        await Product_1.default.findByIdAndUpdate(item.product, {
            quantity: item.currentStock,
            minimumStock: item.minimumStock
        });
        res.status(200).json({
            success: true,
            data: item
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
exports.updateInventoryItem = updateInventoryItem;
// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin)
const deleteInventoryItem = async (req, res, next) => {
    try {
        const item = await Inventory_1.default.findById(req.params.id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: `Inventory item not found with id of ${req.params.id}`
            });
        }
        await Inventory_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteInventoryItem = deleteInventoryItem;
// @desc    Stock In (Restock)
// @route   POST /api/inventory/stock-in
// @access  Private (Admin, Inventory Manager)
const stockIn = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }
        const { product, quantity, supplier, invoiceNumber, notes, date } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid product and quantity values are required'
            });
        }
        let item = await Inventory_1.default.findOne({ product });
        // Auto-create inventory record if it doesn't exist yet
        if (!item) {
            item = new Inventory_1.default({
                product,
                currentStock: 0,
                minimumStock: 0,
                maximumStock: 9999,
                reorderLevel: 0,
                createdBy: req.user.userId
            });
        }
        const qtyNum = parseInt(quantity);
        item.currentStock += qtyNum;
        item.lastRestocked = date ? new Date(date) : new Date();
        await item.save();
        // Log the transaction
        await InventoryLog_1.default.create({
            product,
            inventory: item._id,
            type: 'Stock In',
            quantity: qtyNum,
            remainingStock: item.currentStock,
            supplier,
            invoiceNumber,
            notes,
            date: date ? new Date(date) : new Date(),
            createdBy: req.user.userId
        });
        // Synchronize quantities with corresponding Product
        await Product_1.default.findByIdAndUpdate(product, {
            quantity: item.currentStock
        });
        res.status(200).json({
            success: true,
            data: item
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
exports.stockIn = stockIn;
// @desc    Stock Out (Deduct stock)
// @route   POST /api/inventory/stock-out
// @access  Private (Admin, Inventory Manager)
const stockOut = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }
        const { product, quantity, reason, notes, date } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid product and quantity values are required'
            });
        }
        let item = await Inventory_1.default.findOne({ product });
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Inventory record not found for this product. Perform a Stock In first.'
            });
        }
        const qtyNum = parseInt(quantity);
        if (item.currentStock < qtyNum) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Current stock is ${item.currentStock}, cannot deduct ${qtyNum}.`
            });
        }
        item.currentStock -= qtyNum;
        await item.save();
        // Log the transaction
        await InventoryLog_1.default.create({
            product,
            inventory: item._id,
            type: 'Stock Out',
            quantity: qtyNum,
            remainingStock: item.currentStock,
            reason: reason || 'Other',
            notes,
            date: date ? new Date(date) : new Date(),
            createdBy: req.user.userId
        });
        // Synchronize quantities with corresponding Product
        await Product_1.default.findByIdAndUpdate(product, {
            quantity: item.currentStock
        });
        res.status(200).json({
            success: true,
            data: item
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
exports.stockOut = stockOut;
// @desc    Get Inventory Transaction History
// @route   GET /api/inventory/history/:productId
// @access  Private
const getInventoryHistory = async (req, res, next) => {
    try {
        const logs = await InventoryLog_1.default.find({ product: req.params.productId })
            .populate('createdBy', 'name email')
            .sort({ date: -1 });
        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventoryHistory = getInventoryHistory;
