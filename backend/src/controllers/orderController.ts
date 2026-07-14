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
    const { search, paymentMethod, status, startDate, endDate } = req.query;

    const query: any = {};

    // Search by customer name or Order ID substring
    if (search) {
      const searchStr = search as string;
      const isHex = /^[0-9a-fA-F]+$/.test(searchStr);
      if (isHex && searchStr.length === 24) {
        query.$or = [
          { _id: searchStr },
          { customerName: { $regex: searchStr, $options: 'i' } }
        ];
      } else {
        query.$or = [
          { customerName: { $regex: searchStr, $options: 'i' } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$_id" },
                regex: searchStr,
                options: "i"
              }
            }
          }
        ];
      }
    }

    // Filter by payment method
    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethod = paymentMethod as string;
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status as string;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('store', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // For each order, fetch items
    const populatedOrders = await Promise.all(
      orders.map(async (order: any) => {
        const items = await OrderItem.find({ order: order._id }).populate('product', 'productName sku barcode category sellingPrice');
        return {
          ...order.toObject(),
          items
        };
      })
    );

    res.status(200).json({
      success: true,
      count: total,
      page,
      pages: Math.ceil(total / limit),
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

    const { 
      items, 
      total, 
      customerName = 'Walk-in Customer', 
      paymentMethod = 'Cash',
      subtotal = total,
      discount = 0,
      tax = 0
    } = req.body;

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

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('store', 'name code address phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const items = await OrderItem.find({ order: order._id }).populate('product', 'productName sku barcode category sellingPrice');

    res.status(200).json({
      success: true,
      data: {
        ...order.toObject(),
        items
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { status } = req.body;
    if (!status || !['Pending', 'Completed', 'Cancelled', 'Returned'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Revert stock if transitioning from Completed/Pending to Cancelled/Returned
    if (['Cancelled', 'Returned'].includes(status) && ['Completed', 'Pending'].includes(oldStatus)) {
      const items = await OrderItem.find({ order: order._id });
      for (const item of items) {
        const inv = await Inventory.findOne({ product: item.product });
        if (inv) {
          inv.currentStock += item.quantity;
          await inv.save();

          await InventoryLog.create({
            product: item.product,
            inventory: inv._id,
            type: 'Stock In',
            quantity: item.quantity,
            remainingStock: inv.currentStock,
            reason: status === 'Returned' ? 'Return' : 'Restock',
            notes: `Order status updated to ${status} - Order ID: ${order._id}`,
            createdBy: req.user?.userId
          });

          await Product.findByIdAndUpdate(item.product, {
            quantity: inv.currentStock
          });
        }
      }
    } 
    // Deduct stock if transitioning from Cancelled/Returned back to Completed/Pending
    else if (['Completed', 'Pending'].includes(status) && ['Cancelled', 'Returned'].includes(oldStatus)) {
      const items = await OrderItem.find({ order: order._id });
      for (const item of items) {
        const inv = await Inventory.findOne({ product: item.product });
        if (inv) {
          inv.currentStock = Math.max(0, inv.currentStock - item.quantity);
          await inv.save();

          await InventoryLog.create({
            product: item.product,
            inventory: inv._id,
            type: 'Stock Out',
            quantity: item.quantity,
            remainingStock: inv.currentStock,
            reason: 'Sales',
            notes: `Order status updated to ${status} - Order ID: ${order._id}`,
            createdBy: req.user?.userId
          });

          await Product.findByIdAndUpdate(item.product, {
            quantity: inv.currentStock
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
export const deleteOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Revert inventory if order was Completed or Pending
    if (['Completed', 'Pending'].includes(order.status)) {
      const items = await OrderItem.find({ order: order._id });
      for (const item of items) {
        const inv = await Inventory.findOne({ product: item.product });
        if (inv) {
          inv.currentStock += item.quantity;
          await inv.save();

          await InventoryLog.create({
            product: item.product,
            inventory: inv._id,
            type: 'Stock In',
            quantity: item.quantity,
            remainingStock: inv.currentStock,
            reason: 'Restock',
            notes: `Order Deleted - Order ID: ${order._id}`,
            createdBy: req.user?.userId
          });

          await Product.findByIdAndUpdate(item.product, {
            quantity: inv.currentStock
          });
        }
      }
    }

    // Delete items and parent order
    await OrderItem.deleteMany({ order: order._id });
    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Order and its items deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private
export const getOrderStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'Completed' });
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });

    // Today's start time
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const revenueResult = await Order.aggregate([
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
  } catch (error) {
    next(error);
  }
};
