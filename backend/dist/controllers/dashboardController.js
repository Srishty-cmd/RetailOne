"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const Order_1 = __importDefault(require("../models/Order"));
const OrderItem_1 = __importDefault(require("../models/OrderItem"));
const Inventory_1 = __importDefault(require("../models/Inventory"));
const InventoryLog_1 = __importDefault(require("../models/InventoryLog"));
const User_1 = __importDefault(require("../models/User"));
const getDashboardStats = async (req, res, next) => {
    try {
        const totalProducts = await Product_1.default.countDocuments();
        const totalOrders = await Order_1.default.countDocuments();
        // Calculate total revenue
        const revenueResult = await Order_1.default.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
        // Calculate total inventory stock
        const inventoryResult = await Inventory_1.default.aggregate([
            { $group: { _id: null, totalStock: { $sum: '$currentStock' } } }
        ]);
        const totalInventory = inventoryResult.length > 0 ? inventoryResult[0].totalStock : 0;
        // Count low stock items
        const lowStock = await Inventory_1.default.countDocuments({ status: 'Low Stock' });
        // Fetch total registered users
        const totalUsers = await User_1.default.countDocuments();
        // Calculate today's stats (Transactions, items sold, revenue)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const todayOrders = await Order_1.default.countDocuments({
            status: 'Completed',
            createdAt: { $gte: startOfToday, $lte: endOfToday }
        });
        const todayRevenueResult = await Order_1.default.aggregate([
            { $match: { status: 'Completed', createdAt: { $gte: startOfToday, $lte: endOfToday } } },
            { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
        ]);
        const todayRevenue = todayRevenueResult.length > 0 ? todayRevenueResult[0].totalRevenue : 0;
        // Calculate today's items sold
        const todayItemsResult = await OrderItem_1.default.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order',
                    foreignField: '_id',
                    as: 'orderInfo'
                }
            },
            { $unwind: '$orderInfo' },
            {
                $match: {
                    'orderInfo.status': 'Completed',
                    'orderInfo.createdAt': { $gte: startOfToday, $lte: endOfToday }
                }
            },
            { $group: { _id: null, totalItems: { $sum: '$quantity' } } }
        ]);
        const todayItemsSold = todayItemsResult.length > 0 ? todayItemsResult[0].totalItems : 0;
        // Calculate weekly sales history (last 7 days, including today)
        const salesHistory = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateString = d.toISOString().split('T')[0];
            const startOfDay = new Date(d);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(d);
            endOfDay.setHours(23, 59, 59, 999);
            const dayRevenueResult = await Order_1.default.aggregate([
                { $match: { status: 'Completed', createdAt: { $gte: startOfDay, $lte: endOfDay } } },
                { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
            ]);
            const revenue = dayRevenueResult.length > 0 ? dayRevenueResult[0].totalRevenue : 0;
            const count = await Order_1.default.countDocuments({
                status: 'Completed',
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });
            const label = d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit' });
            salesHistory.push({
                date: dateString,
                label,
                revenue,
                count
            });
        }
        // Fetch recent activity from InventoryLog
        const recentLogs = await InventoryLog_1.default.find()
            .populate('product', 'productName')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .limit(5);
        const recentActivities = recentLogs.map((log) => {
            const productName = log.product ? log.product.productName : 'Unknown Product';
            const userName = log.createdBy ? log.createdBy.name : 'System';
            const action = log.type === 'Stock In' ? 'added to' : 'removed from';
            const details = log.reason ? ` (${log.reason})` : '';
            return {
                id: log._id,
                text: `${userName} ${action} stock for "${productName}": ${log.quantity} units${details}.`,
                time: log.createdAt
            };
        });
        // Fetch active alerts (Low Stock or Out of Stock)
        const alertItems = await Inventory_1.default.find({ status: { $in: ['Low Stock', 'Out of Stock'] } })
            .populate('product', 'productName sku')
            .limit(5);
        const alerts = alertItems.map((item) => ({
            id: item._id,
            productName: item.product ? item.product.productName : 'Deleted Product',
            sku: item.product ? item.product.sku : 'N/A',
            status: item.status,
            currentStock: item.currentStock,
            minimumStock: item.minimumStock
        }));
        res.status(200).json({
            success: true,
            data: {
                totalProducts,
                totalOrders,
                totalRevenue,
                totalInventory,
                lowStock,
                totalUsers,
                todayOrders,
                todayRevenue,
                todayItemsSold,
                salesHistory,
                recentActivities,
                alerts
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
