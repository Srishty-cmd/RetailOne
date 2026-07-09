import { Response, NextFunction } from 'express';
import { AuthRequest } from './authController';
import Product from '../models/Product';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import Inventory from '../models/Inventory';
import InventoryLog from '../models/InventoryLog';
import User from '../models/User';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Calculate total inventory stock
    const inventoryResult = await Inventory.aggregate([
      { $group: { _id: null, totalStock: { $sum: '$currentStock' } } }
    ]);
    const totalInventory = inventoryResult.length > 0 ? inventoryResult[0].totalStock : 0;

    // Count low stock items
    const lowStock = await Inventory.countDocuments({ status: 'Low Stock' });

    // Fetch total registered users
    const totalUsers = await User.countDocuments();

    // Calculate today's stats (Transactions, items sold, revenue)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayOrders = await Order.countDocuments({
      status: 'Completed',
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });

    const todayRevenueResult = await Order.aggregate([
      { $match: { status: 'Completed', createdAt: { $gte: startOfToday, $lte: endOfToday } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const todayRevenue = todayRevenueResult.length > 0 ? todayRevenueResult[0].totalRevenue : 0;

    // Calculate today's items sold
    const todayItemsResult = await OrderItem.aggregate([
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

      const dayRevenueResult = await Order.aggregate([
        { $match: { status: 'Completed', createdAt: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
      ]);
      const revenue = dayRevenueResult.length > 0 ? dayRevenueResult[0].totalRevenue : 0;
      
      const count = await Order.countDocuments({
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
    const recentLogs = await InventoryLog.find()
      .populate('product', 'productName')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivities = recentLogs.map((log: any) => {
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
    const alertItems = await Inventory.find({ status: { $in: ['Low Stock', 'Out of Stock'] } })
      .populate('product', 'productName sku')
      .limit(5);

    const alerts = alertItems.map((item: any) => ({
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
  } catch (error) {
    next(error);
  }
};
