import mongoose from 'mongoose'

const productSchema = mongoose.Schema({
  sellerId: { type: String },
  id: { type: String },
  code: { type: String, required: true },
  cover: { type: String },
  images: { type: [String], required: true },
  minBiddingPrice: { type: mongoose.Types.Decimal128, required: true },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  tags: { type: [String], required: true },
  biddingStatus: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now }
})

export default mongoose.model('Product', productSchema)
