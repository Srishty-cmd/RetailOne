"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = exports.getOrders = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const OrderItem_1 = __importDefault(require("../models/OrderItem"));
const Product_1 = __importDefault(require("../models/Product"));
const Inventory_1 = __importDefault(require("../models/Inventory"));
const InventoryLog_1 = __importDefault(require("../models/InventoryLog"));
const Store_1 = __importDefault(require("../models/Store"));
// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res, next) => {
    try {
        const orders = await Order_1.default.find()
            .populate('user', 'name email')
            .populate('store', 'name code')
            .sort({ createdAt: -1 });
        // For each order, fetch items
        const populatedOrders = await Promise.all(orders.map(async (order) => {
            const items = await OrderItem_1.default.find({ order: order._id }).populate('product', 'productName sku');
            return {
                ...order.toObject(),
                items
            };
        }));
        res.status(200).json({
            success: true,
            count: populatedOrders.length,
            data: populatedOrders
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrders = getOrders;
// @desc    Create new order (Checkout)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { items, total } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart items are required' });
        }
        // 1. Resolve Store ID
        let storeId = req.body.storeId || req.user.store;
        if (!storeId) {
            const anyStore = await Store_1.default.findOne();
            if (anyStore) {
                storeId = anyStore._id;
            }
            else {
                const defaultStore = await Store_1.default.create({
                    name: 'Main Store',
                    code: 'STR-MAIN',
                    address: 'Default Address',
                    phone: '000-0000000',
                    isActive: true
                });
                storeId = defaultStore._id;
            }
        }
        // 2. Validate inventory stock levels for all items first
        for (const item of items) {
            const inv = await Inventory_1.default.findOne({ product: item.product });
            if (!inv) {
                return res.status(404).json({
                    success: false,
                    message: `Inventory tracking not found for product ID ${item.product}. Perform Stock In first.`
                });
            }
            if (inv.currentStock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product. Available: ${inv.currentStock}, requested: ${item.quantity}.`
                });
            }
        }
        // 3. Create the parent Order
        const order = await Order_1.default.create({
            store: storeId,
            user: req.user.userId,
            total,
            status: 'Completed'
        });
        // 4. Create OrderItems, deduct stock, and write logs
        for (const item of items) {
            // Create Order Item record
            await OrderItem_1.default.create({
                order: order._id,
                product: item.product,
                quantity: item.quantity,
                price: item.price
            });
            // Deduct stock in Inventory
            const inv = await Inventory_1.default.findOne({ product: item.product });
            if (inv) {
                inv.currentStock -= item.quantity;
                await inv.save(); // pre-save will automatically compute and update status (Low Stock, Out of Stock, etc.)
                // Create transaction log
                await InventoryLog_1.default.create({
                    product: item.product,
                    inventory: inv._id,
                    type: 'Stock Out',
                    quantity: item.quantity,
                    remainingStock: inv.currentStock,
                    reason: 'Sales',
                    notes: `Sales Checkout - Order ID: ${order._id}`,
                    createdBy: req.user.userId
                });
                // Sync quantity in Product collection
                await Product_1.default.findByIdAndUpdate(item.product, {
                    quantity: inv.currentStock
                });
            }
        }
        // Return the created order with populated items
        const orderItems = await OrderItem_1.default.find({ order: order._id }).populate('product', 'productName sku');
        res.status(201).json({
            success: true,
            data: {
                ...order.toObject(),
                items: orderItems
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
