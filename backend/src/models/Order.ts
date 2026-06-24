import mongoose, { Schema } from 'mongoose';

const OrderSchema = new Schema({
  store: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  total: { type: Number, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Completed', 'Cancelled'] }
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);
