"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderStats = exports.deleteOrder = exports.updateOrderStatus = exports.getOrderById = exports.createOrder = exports.getOrders = void 0;
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
        const { search, paymentMethod, status, startDate, endDate } = req.query;
        const query = {};
        // Search by customer name or Order ID substring
        if (search) {
            const searchStr = search;
            const escapedStr = searchStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const isHex = /^[0-9a-fA-F]+$/.test(searchStr);
            if (isHex && searchStr.length === 24) {
                query.$or = [
                    { _id: searchStr },
                    { customerName: { $regex: escapedStr, $options: 'i' } }
                ];
            }
            else {
                query.$or = [
                    { customerName: { $regex: escapedStr, $options: 'i' } },
                    {
                        $expr: {
                            $regexMatch: {
                                input: { $toString: "$_id" },
                                regex: escapedStr,
                                options: "i"
                            }
                        }
                    }
                ];
            }
        }
        // Filter by payment method
        if (paymentMethod && paymentMethod !== 'All') {
            query.paymentMethod = paymentMethod;
        }
        // Filter by status
        if (status && status !== 'All') {
            query.status = status;
        }
        // Filter by date range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;
        const total = await Order_1.default.countDocuments(query);
        const orders = await Order_1.default.find(query)
            .populate('user', 'name email')
            .populate('store', 'name code')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        // For each order, fetch items
        const populatedOrders = await Promise.all(orders.map(async (order) => {
            const items = await OrderItem_1.default.find({ order: order._id }).populate('product', 'productName sku barcode category sellingPrice');
            return {
                ...order.toObject(),
                items
            };
        }));
        res.status(200).json({
            success: true,
            count: total,
            page,
            pages: Math.ceil(total / limit),
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
        const { items, total, customerName = 'Walk-in Customer', paymentMethod = 'Cash', subtotal = total, discount = 0, tax = 0 } = req.body;
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
            customerName,
            total,
            status: 'Completed',
            paymentMethod,
            subtotal,
            discount,
            tax
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
// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
    try {
        const order = await Order_1.default.findById(req.params.id)
            .populate('user', 'name email')
            .populate('store', 'name code address phone');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        const items = await OrderItem_1.default.find({ order: order._id }).populate('product', 'productName sku barcode category sellingPrice');
        res.status(200).json({
            success: true,
            data: {
                ...order.toObject(),
                items
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderById = getOrderById;
// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!status || !['Pending', 'Completed', 'Cancelled', 'Returned'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Valid status is required' });
        }
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        const oldStatus = order.status;
        order.status = status;
        await order.save();
        // Revert stock if transitioning from Completed/Pending to Cancelled/Returned
        if (['Cancelled', 'Returned'].includes(status) && ['Completed', 'Pending'].includes(oldStatus)) {
            const items = await OrderItem_1.default.find({ order: order._id });
            for (const item of items) {
                const inv = await Inventory_1.default.findOne({ product: item.product });
                if (inv) {
                    inv.currentStock += item.quantity;
                    await inv.save();
                    await InventoryLog_1.default.create({
                        product: item.product,
                        inventory: inv._id,
                        type: 'Stock In',
                        quantity: item.quantity,
                        remainingStock: inv.currentStock,
                        reason: 'Other',
                        notes: `Order status updated to ${status} - Order ID: ${order._id}`,
                        createdBy: req.user?.userId
                    });
                    await Product_1.default.findByIdAndUpdate(item.product, {
                        quantity: inv.currentStock
                    });
                }
            }
        }
        // Deduct stock if transitioning from Cancelled/Returned back to Completed/Pending
        else if (['Completed', 'Pending'].includes(status) && ['Cancelled', 'Returned'].includes(oldStatus)) {
            const items = await OrderItem_1.default.find({ order: order._id });
            for (const item of items) {
                const inv = await Inventory_1.default.findOne({ product: item.product });
                if (inv) {
                    inv.currentStock = Math.max(0, inv.currentStock - item.quantity);
                    await inv.save();
                    await InventoryLog_1.default.create({
                        product: item.product,
                        inventory: inv._id,
                        type: 'Stock Out',
                        quantity: item.quantity,
                        remainingStock: inv.currentStock,
                        reason: 'Sales',
                        notes: `Order status updated to ${status} - Order ID: ${order._id}`,
                        createdBy: req.user?.userId
                    });
                    await Product_1.default.findByIdAndUpdate(item.product, {
                        quantity: inv.currentStock
                    });
                }
            }
        }
        res.status(200).json({
            success: true,
            data: order
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateOrderStatus = updateOrderStatus;
// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
const deleteOrder = async (req, res, next) => {
    try {
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        // Revert inventory if order was Completed or Pending
        if (['Completed', 'Pending'].includes(order.status)) {
            const items = await OrderItem_1.default.find({ order: order._id });
            for (const item of items) {
                const inv = await Inventory_1.default.findOne({ product: item.product });
                if (inv) {
                    inv.currentStock += item.quantity;
                    await inv.save();
                    await InventoryLog_1.default.create({
                        product: item.product,
                        inventory: inv._id,
                        type: 'Stock In',
                        quantity: item.quantity,
                        remainingStock: inv.currentStock,
                        reason: 'Other',
                        notes: `Order Deleted - Order ID: ${order._id}`,
                        createdBy: req.user?.userId
                    });
                    await Product_1.default.findByIdAndUpdate(item.product, {
                        quantity: inv.currentStock
                    });
                }
            }
        }
        // Delete items and parent order
        await OrderItem_1.default.deleteMany({ order: order._id });
        await order.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Order and its items deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteOrder = deleteOrder;
// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private
const getOrderStats = async (req, res, next) => {
    try {
        const totalOrders = await Order_1.default.countDocuments();
        const completedOrders = await Order_1.default.countDocuments({ status: 'Completed' });
        const pendingOrders = await Order_1.default.countDocuments({ status: 'Pending' });
        // Today's start time
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const revenueResult = await Order_1.default.aggregate([
            {
                $match: {
                    status: 'Completed',
                    createdAt: { $gte: startOfToday }
                }
            },
            {
                $group: {
                    _id: null,
                    todayRevenue: { $sum: '$total' }
                }
            }
        ]);
        const todayRevenue = revenueResult.length > 0 ? revenueResult[0].todayRevenue : 0;
        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                completedOrders,
                pendingOrders,
                todayRevenue
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderStats = getOrderStats;
