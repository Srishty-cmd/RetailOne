import { Response, NextFunction } from 'express';
import { AuthRequest } from './authController';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import Product from '../models/Product';
import Inventory from '../models/Inventory';
import InventoryLog from '../models/InventoryLog';
import Store from '../models/Store';

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('store', 'name code')
      .sort({ createdAt: -1 });

    // For each order, fetch items
    const populatedOrders = await Promise.all(
      orders.map(async (order: any) => {
        const items = await OrderItem.find({ order: order._id }).populate('product', 'productName sku');
        return {
          ...order.toObject(),
          items
        };
      })
    );

    res.status(200).json({
      success: true,
      count: populatedOrders.length,
      data: populatedOrders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new order (Checkout)
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { items, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    // 1. Resolve Store ID
    let storeId = req.body.storeId || (req.user as any).store;
    if (!storeId) {
      const anyStore = await Store.findOne();
      if (anyStore) {
        storeId = anyStore._id;
      } else {
        const defaultStore = await Store.create({
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
      const inv = await Inventory.findOne({ product: item.product });
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
    const order = await Order.create({
      store: storeId,
      user: req.user.userId,
      total,
      status: 'Completed'
    });

    // 4. Create OrderItems, deduct stock, and write logs
    for (const item of items) {
      // Create Order Item record
      await OrderItem.create({
        order: order._id,
        product: item.product,
        quantity: item.quantity,
        price: item.price
      });

      // Deduct stock in Inventory
      const inv = await Inventory.findOne({ product: item.product });
      if (inv) {
        inv.currentStock -= item.quantity;
        await inv.save(); // pre-save will automatically compute and update status (Low Stock, Out of Stock, etc.)

        // Create transaction log
        await InventoryLog.create({
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
        await Product.findByIdAndUpdate(item.product, {
          quantity: inv.currentStock
        });
      }
    }

    // Return the created order with populated items
    const orderItems = await OrderItem.find({ order: order._id }).populate('product', 'productName sku');
    
    res.status(201).json({
      success: true,
      data: {
        ...order.toObject(),
        items: orderItems
      }
    });
  } catch (error) {
    next(error);
  }
};
