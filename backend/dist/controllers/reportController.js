"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportData = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const Order_1 = __importDefault(require("../models/Order"));
const OrderItem_1 = __importDefault(require("../models/OrderItem"));
const Inventory_1 = __importDefault(require("../models/Inventory"));
const getReportData = async (req, res, next) => {
    try {
        let start = new Date();
        let end = new Date();
        const filter = req.query.filter;
        const startParam = req.query.startDate;
        const endParam = req.query.endDate;
        if (filter === 'today') {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        }
        else if (filter === '7days') {
            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        }
        else if (filter === '30days') {
            start.setDate(start.getDate() - 29);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        }
        else if (filter === 'monthly') {
            start = new Date(start.getFullYear(), start.getMonth(), 1);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        }
        else if (filter === 'custom' && startParam && endParam) {
            start = new Date(startParam);
            start.setHours(0, 0, 0, 0);
            end = new Date(endParam);
            end.setHours(23, 59, 59, 999);
        }
        else {
            // Default to last 30 days
            start.setDate(start.getDate() - 29);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        }
        // 1. Summary Cards Calculations
        // Range-specific stats (Revenue, total orders, completed, pending)
        const orderStats = await Order_1.default.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'Completed'] }, '$total', 0]
                        }
                    },
                    totalOrders: { $sum: 1 },
                    completedOrdersCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    },
                    pendingOrdersCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
                    }
                }
            }
        ]);
        const rangeStats = orderStats[0] || {
            totalRevenue: 0,
            totalOrders: 0,
            completedOrdersCount: 0,
            pendingOrdersCount: 0
        };
        // Today's Sales (Completed today)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const todayRevenueResult = await Order_1.default.aggregate([
            {
                $match: {
                    status: 'Completed',
                    createdAt: { $gte: todayStart, $lte: todayEnd }
                }
            },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const todaySales = todayRevenueResult[0]?.total || 0;
        // Monthly Revenue (Completed in current calendar month)
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);
        const monthlyRevenueResult = await Order_1.default.aggregate([
            {
                $match: {
                    status: 'Completed',
                    createdAt: { $gte: currentMonthStart, $lte: todayEnd }
                }
            },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;
        const totalProducts = await Product_1.default.countDocuments();
        const lowStockProducts = await Inventory_1.default.countDocuments({ status: 'Low Stock' });
        // 2. Sales Trend & Revenue Trend (Daily points in the filter range)
        const salesTrend = await Order_1.default.aggregate([
            {
                $match: {
                    status: 'Completed',
                    createdAt: { $gte: start, $lte: end }
                }
            },
            {
                $project: {
                    dateStr: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    total: 1
                }
            },
            {
                $group: {
                    _id: '$dateStr',
                    revenue: { $sum: '$total' },
                    ordersCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        // Fill in missing dates in the trend chart
        const trendMap = new Map();
        salesTrend.forEach((item) => {
            trendMap.set(item._id, { revenue: item.revenue, ordersCount: item.ordersCount });
        });
        const filledTrend = [];
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 60) {
            // Group by month if range is very large
            const monthlyTrend = await Order_1.default.aggregate([
                {
                    $match: {
                        status: 'Completed',
                        createdAt: { $gte: start, $lte: end }
                    }
                },
                {
                    $project: {
                        monthStr: {
                            $dateToString: { format: '%Y-%m', date: '$createdAt' }
                        },
                        total: 1
                    }
                },
                {
                    $group: {
                        _id: '$monthStr',
                        revenue: { $sum: '$total' },
                        ordersCount: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
            monthlyTrend.forEach((item) => {
                filledTrend.push({
                    date: item._id,
                    label: item._id,
                    revenue: item.revenue,
                    ordersCount: item.ordersCount
                });
            });
        }
        else {
            // Group by daily
            const curr = new Date(start);
            while (curr <= end) {
                const key = curr.toISOString().split('T')[0];
                const data = trendMap.get(key) || { revenue: 0, ordersCount: 0 };
                filledTrend.push({
                    date: key,
                    label: new Date(curr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    revenue: data.revenue,
                    ordersCount: data.ordersCount
                });
                curr.setDate(curr.getDate() + 1);
            }
        }
        // 3. Monthly Sales Bar Chart (Last 12 calendar months trend)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);
        const monthlySalesTrend = await Order_1.default.aggregate([
            {
                $match: {
                    status: 'Completed',
                    createdAt: { $gte: twelveMonthsAgo }
                }
            },
            {
                $project: {
                    monthStr: {
                        $dateToString: { format: '%Y-%m', date: '$createdAt' }
                    },
                    total: 1
                }
            },
            {
                $group: {
                    _id: '$monthStr',
                    revenue: { $sum: '$total' },
                    ordersCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        const monthlySalesTrendMap = new Map();
        monthlySalesTrend.forEach((item) => {
            monthlySalesTrendMap.set(item._id, { revenue: item.revenue, ordersCount: item.ordersCount });
        });
        const filledMonthlyTrend = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const data = monthlySalesTrendMap.get(key) || { revenue: 0, ordersCount: 0 };
            filledMonthlyTrend.push({
                month: key,
                label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                revenue: data.revenue,
                ordersCount: data.ordersCount
            });
        }
        // 4. Product Category Distribution (Pie Chart)
        const categorySales = await OrderItem_1.default.aggregate([
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
                    'orderInfo.createdAt': { $gte: start, $lte: end }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $group: {
                    _id: '$productInfo.category',
                    revenue: { $sum: { $multiply: ['$quantity', '$price'] } },
                    quantity: { $sum: '$quantity' }
                }
            },
            { $project: { category: '$_id', revenue: 1, quantity: 1, _id: 0 } },
            { $sort: { revenue: -1 } }
        ]);
        // 5. Payment Method Distribution
        const paymentDistribution = await Order_1.default.aggregate([
            {
                $match: {
                    status: 'Completed',
                    createdAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    revenue: { $sum: '$total' },
                    count: { $sum: 1 }
                }
            },
            { $project: { method: '$_id', revenue: 1, count: 1, _id: 0 } }
        ]);
        // 6. Top Selling Products
        const topProducts = await OrderItem_1.default.aggregate([
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
                    'orderInfo.createdAt': { $gte: start, $lte: end }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $group: {
                    _id: '$product',
                    productName: { $first: '$productInfo.productName' },
                    sku: { $first: '$productInfo.sku' },
                    category: { $first: '$productInfo.category' },
                    quantitySold: { $sum: '$quantity' },
                    revenue: { $sum: { $multiply: ['$quantity', '$price'] } }
                }
            },
            { $sort: { quantitySold: -1 } },
            { $limit: 10 }
        ]);
        // 7. Low Stock Report
        const lowStockReport = await Inventory_1.default.find({
            status: { $in: ['Low Stock', 'Out of Stock'] }
        })
            .populate('product', 'productName sku category sellingPrice')
            .lean();
        const lowStockList = lowStockReport.map((inv) => ({
            inventoryId: inv._id,
            productId: inv.product?._id || null,
            productName: inv.product?.productName || 'Unknown Product',
            sku: inv.product?.sku || 'N/A',
            category: inv.product?.category || 'N/A',
            currentStock: inv.currentStock,
            minimumStock: inv.minimumStock,
            status: inv.status
        }));
        // 8. Store-wise Sales
        const storeSales = await Order_1.default.aggregate([
            {
                $match: {
                    status: 'Completed',
                    createdAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: '$store',
                    revenue: { $sum: '$total' },
                    ordersCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'stores',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'storeInfo'
                }
            },
            { $unwind: '$storeInfo' },
            {
                $project: {
                    storeId: '$_id',
                    name: '$storeInfo.name',
                    code: '$storeInfo.code',
                    revenue: 1,
                    ordersCount: 1,
                    _id: 0
                }
            },
            { $sort: { revenue: -1 } }
        ]);
        // 9. Inventory Summary
        const inventorySummary = await Inventory_1.default.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $group: {
                    _id: null,
                    totalItems: { $sum: '$currentStock' },
                    totalCostValue: { $sum: { $multiply: ['$currentStock', '$productInfo.costPrice'] } },
                    totalSellingValue: { $sum: { $multiply: ['$currentStock', '$productInfo.sellingPrice'] } }
                }
            }
        ]);
        const currentSummary = inventorySummary[0] || {
            totalItems: 0,
            totalCostValue: 0,
            totalSellingValue: 0
        };
        const totalInventoryItems = await Inventory_1.default.countDocuments();
        const totalLowStockCount = await Inventory_1.default.countDocuments({ status: 'Low Stock' });
        const totalOutOfStockCount = await Inventory_1.default.countDocuments({ currentStock: 0 });
        const totalInStockCount = await Inventory_1.default.countDocuments({ status: 'In Stock' });
        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalRevenue: rangeStats.totalRevenue,
                    todaySales,
                    monthlyRevenue,
                    totalOrders: rangeStats.totalOrders,
                    completedOrders: rangeStats.completedOrdersCount,
                    pendingOrders: rangeStats.pendingOrdersCount,
                    totalProducts,
                    lowStockProducts
                },
                salesTrend: filledTrend,
                monthlySalesTrend: filledMonthlyTrend,
                categorySales,
                paymentDistribution,
                topProducts,
                lowStockList,
                storeSales,
                inventorySummary: {
                    totalItemsStock: currentSummary.totalItems,
                    totalCostValue: currentSummary.totalCostValue,
                    totalSellingValue: currentSummary.totalSellingValue,
                    totalCount: totalInventoryItems,
                    lowStockCount: totalLowStockCount,
                    outOfStockCount: totalOutOfStockCount,
                    inStockCount: totalInStockCount
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getReportData = getReportData;
