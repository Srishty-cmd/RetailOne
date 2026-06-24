import mongoose, { Document, Schema } from 'mongoose';

export interface IStore extends Document {
  name: string;
  code: string;
  address: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please add a store name'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Please add a store code'],
    unique: true,
    trim: true,
    uppercase: true
  },
  address: {
    type: String,
    required: [true, 'Please add a store address']
  },
  phone: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IStore>('Store', StoreSchema);
