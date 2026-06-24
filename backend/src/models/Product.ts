import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  sku: { type: String, unique: true },
  image: { type: String }
}, { timestamps: true });

export default mongoose.model('Product', ProductSchema);
