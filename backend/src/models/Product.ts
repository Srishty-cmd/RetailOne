import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  productName: string;
  sku: string;
  barcode?: string;
  category: string;
  brand?: string;
  description?: string;
  sellingPrice: number;
  costPrice: number;
  quantity: number;
  minimumStock: number;
  status: 'Active' | 'Inactive';
  image?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  barcode: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Selling price cannot be negative']
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  minimumStock: {
    type: Number,
    required: [true, 'Minimum stock level is required'],
    min: [0, 'Minimum stock cannot be negative'],
    default: 0
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['Active', 'Inactive'],
      message: 'Status must be either Active or Inactive'
    },
    default: 'Active'
  },
  image: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user reference is required']
  }
}, {
  timestamps: true
});

// Index for efficient search
ProductSchema.index({ productName: 'text', sku: 'text', barcode: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);
