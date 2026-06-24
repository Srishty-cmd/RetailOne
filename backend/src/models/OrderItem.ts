import mongoose, { Schema } from 'mongoose';

const OrderItemSchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('OrderItem', OrderItemSchema);
