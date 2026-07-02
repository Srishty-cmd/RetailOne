import mongoose, { Document, Schema } from 'mongoose';

export interface IInventory extends Document {
  product: mongoose.Types.ObjectId;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  warehouseLocation?: string;
  lastRestocked?: Date;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema: Schema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required'],
    unique: true
  },
  currentStock: {
    type: Number,
    required: [true, 'Current stock quantity is required'],
    min: [0, 'Current stock cannot be negative'],
    default: 0
  },
  minimumStock: {
    type: Number,
    required: [true, 'Minimum stock level is required'],
    min: [0, 'Minimum stock cannot be negative'],
    default: 0
  },
  maximumStock: {
    type: Number,
    required: [true, 'Maximum stock level is required'],
    min: [0, 'Maximum stock cannot be negative'],
    default: 0
  },
  reorderLevel: {
    type: Number,
    required: [true, 'Reorder level quantity is required'],
    min: [0, 'Reorder level cannot be negative'],
    default: 0
  },
  warehouseLocation: {
    type: String,
    trim: true
  },
  lastRestocked: {
    type: Date
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by reference is required']
  }
}, {
  timestamps: true
});

// Middleware to automatically compute status before saving
InventorySchema.pre('save', function (this: any) {
  if (this.currentStock === 0) {
    this.status = 'Out of Stock';
  } else if (this.currentStock <= this.minimumStock) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
});

export default mongoose.model<IInventory>('Inventory', InventorySchema);
