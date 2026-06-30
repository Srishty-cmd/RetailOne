import { Response, NextFunction } from 'express';
import { AuthRequest } from './authController';
import Product from '../models/Product';

// @desc    Get all products (with pagination, filtering, search)
// @route   GET /api/products
// @access  Private
export const getProducts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { search, category, status } = req.query;
    
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (search) {
      query.$or = [
        { productName: { $regex: search as string, $options: 'i' } },
        { sku: { $regex: search as string, $options: 'i' } },
        { barcode: { $regex: search as string, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category as string;
    }

    if (status && status !== 'All') {
      query.status = status as string;
    }

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin, Inventory Manager)
export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    req.body.createdBy = req.user.userId;

    // Check SKU uniqueness manually to return a nice message
    const { sku } = req.body;
    if (sku) {
      const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: `Product with SKU '${sku}' already exists`
        });
      }
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
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

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin, Inventory Manager)
export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id of ${req.params.id}`
      });
    }

    // Check SKU uniqueness manually if SKU is being updated
    const { sku } = req.body;
    if (sku && sku.toUpperCase() !== product.sku) {
      const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: `Product with SKU '${sku}' already exists`
        });
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
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

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id of ${req.params.id}`
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
