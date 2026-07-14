import mongoose, { Schema } from 'mongoose';

const OrderSchema = new Schema({
  store: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, default: 'Walk-in Customer' },
  total: { type: Number, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Completed', 'Cancelled', 'Returned'] },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI'], default: 'Cash' },
  subtotal: { type: Number },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);
