import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryLog extends Document {
  product: mongoose.Types.ObjectId;
  inventory: mongoose.Types.ObjectId;
  type: 'Stock In' | 'Stock Out';
  quantity: number;
  remainingStock: number;
  reason?: 'Sales' | 'Damaged' | 'Lost' | 'Expired' | 'Other';
  supplier?: string;
  invoiceNumber?: string;
  notes?: string;
  date: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryLogSchema: Schema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  inventory: {
    type: Schema.Types.ObjectId,
    ref: 'Inventory',
    required: [true, 'Inventory reference is required']
  },
  type: {
    type: String,
    enum: ['Stock In', 'Stock Out'],
    required: [true, 'Transaction type is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  remainingStock: {
    type: Number,
    required: [true, 'Remaining stock after transaction is required'],
    min: [0, 'Remaining stock cannot be negative']
  },
  reason: {
    type: String,
    enum: ['Sales', 'Damaged', 'Lost', 'Expired', 'Other'],
    required: function(this: any) {
      return this.type === 'Stock Out';
    }
  },
  supplier: {
    type: String,
    trim: true
  },
  invoiceNumber: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  }
}, {
  timestamps: true
});

export default mongoose.model<IInventoryLog>('InventoryLog', InventoryLogSchema);
