import mongoose, { Schema } from 'mongoose';

const InventorySchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  store: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  quantity: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Inventory', InventorySchema);
