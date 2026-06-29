import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  description?: string;
  category: string;
  brand?: string;
  price: number;
  costPrice: number;
  stock: number;
  unit: string;
  status: 'Active' | 'Inactive';
  image?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: {
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
  description: {
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
  price: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Price cannot be negative']
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock level is required'],
    min: [0, 'Stock level cannot be negative'],
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Unit of measurement is required'],
    default: 'pcs',
    trim: true
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
ProductSchema.index({ name: 'text', sku: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);
