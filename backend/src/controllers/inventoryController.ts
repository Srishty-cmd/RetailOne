import { Response, NextFunction } from 'express';
import { AuthRequest } from './authController';
import Inventory from '../models/Inventory';
import InventoryLog from '../models/InventoryLog';
import Product from '../models/Product';

// @desc    Get all inventory items (with pagination, filtering, search)
// @route   GET /api/inventory
// @access  Private
export const getInventoryItems = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { search, category, status } = req.query;

    // Self-healing: Ensure all products have a corresponding inventory record
    if (req.user) {
      const allProducts = await Product.find().select('_id quantity minimumStock createdBy');
      for (const prod of allProducts) {
        const exists = await Inventory.findOne({ product: prod._id });
        if (!exists) {
          await Inventory.create({
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build product-level query
    const productQuery: any = {};
    if (search) {
      productQuery.$or = [
        { productName: { $regex: search as string, $options: 'i' } },
        { sku: { $regex: search as string, $options: 'i' } }
      ];
    }
    if (category && category !== 'All') {
      productQuery.category = category as string;
    }

    // Retrieve matching product IDs
    const matchedProducts = await Product.find(productQuery).select('_id');
    const productIds = matchedProducts.map(p => p._id);

    // Build inventory-level query
    const query: any = { product: { $in: productIds } };
    if (status && status !== 'All') {
      query.status = status as string;
    }

    const total = await Inventory.countDocuments(query);

    const inventoryItems = await Inventory.find(query)
      .populate('product', 'productName sku category sellingPrice costPrice image brand minimumStock quantity')
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate global stats
    const totalCount = await Inventory.countDocuments();
    const inStockCount = await Inventory.countDocuments({ status: 'In Stock' });
    const lowStockCount = await Inventory.countDocuments({ status: 'Low Stock' });
    const outOfStockCount = await Inventory.countDocuments({ status: 'Out of Stock' });

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
  } catch (error) {
    next(error);
  }
};

// @desc    Get single inventory item by ID
// @route   GET /api/inventory/:id
// @access  Private
export const getInventoryItemById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const item = await Inventory.findById(req.params.id)
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
  } catch (error) {
    next(error);
  }
};

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private (Admin, Inventory Manager)
export const createInventoryItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { product, currentStock, minimumStock, maximumStock, reorderLevel, warehouseLocation } = req.body;

    // Check if inventory for product already exists
    const existingInventory = await Inventory.findOne({ product });
    if (existingInventory) {
      return res.status(400).json({
        success: false,
        message: 'Inventory record for this product already exists'
      });
    }

    // Verify product exists
    const matchedProduct = await Product.findById(product);
    if (!matchedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const newItem = await Inventory.create({
      product,
      currentStock: currentStock || 0,
      minimumStock: minimumStock || 0,
      maximumStock: maximumStock || 0,
      reorderLevel: reorderLevel || 0,
      warehouseLocation,
      createdBy: req.user.userId
    });

    // Synchronize currentStock and minimumStock with the Product
    await Product.findByIdAndUpdate(product, {
      quantity: newItem.currentStock,
      minimumStock: newItem.minimumStock
    });

    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    next(error);
  }
};

// @desc    Update inventory item details
// @route   PUT /api/inventory/:id
// @access  Private (Admin, Inventory Manager)
export const updateInventoryItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { currentStock, minimumStock, maximumStock, reorderLevel, warehouseLocation } = req.body;

    let item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Inventory item not found with id of ${req.params.id}`
      });
    }

    // Apply updates manually to trigger schema pre-save hooks
    if (currentStock !== undefined) item.currentStock = currentStock;
    if (minimumStock !== undefined) item.minimumStock = minimumStock;
    if (maximumStock !== undefined) item.maximumStock = maximumStock;
    if (reorderLevel !== undefined) item.reorderLevel = reorderLevel;
    if (warehouseLocation !== undefined) item.warehouseLocation = warehouseLocation;

    await item.save();

    // Synchronize quantities with corresponding Product
    await Product.findByIdAndUpdate(item.product, {
      quantity: item.currentStock,
      minimumStock: item.minimumStock
    });

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    next(error);
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin)
export const deleteInventoryItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Inventory item not found with id of ${req.params.id}`
      });
    }

    await Inventory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stock In (Restock)
// @route   POST /api/inventory/stock-in
// @access  Private (Admin, Inventory Manager)
export const stockIn = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
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

    let item = await Inventory.findOne({ product });
    
    // Auto-create inventory record if it doesn't exist yet
    if (!item) {
      item = new Inventory({
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
    await InventoryLog.create({
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
    await Product.findByIdAndUpdate(product, {
      quantity: item.currentStock
    });

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    next(error);
  }
};

// @desc    Stock Out (Deduct stock)
// @route   POST /api/inventory/stock-out
// @access  Private (Admin, Inventory Manager)
export const stockOut = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
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

    let item = await Inventory.findOne({ product });
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
    await InventoryLog.create({
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
    await Product.findByIdAndUpdate(product, {
      quantity: item.currentStock
    });

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    next(error);
  }
};

// @desc    Get Inventory Transaction History
// @route   GET /api/inventory/history/:productId
// @access  Private
export const getInventoryHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const logs = await InventoryLog.find({ product: req.params.productId })
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
