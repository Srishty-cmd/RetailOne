import { Response, NextFunction } from 'express';
import { AuthRequest } from './authController';
import Product from '../models/Product';
import Order from '../models/Order';
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
        recentActivities,
        alerts
      }
    });
  } catch (error) {
    next(error);
  }
};
