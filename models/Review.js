import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'product'
  },
  userId: {
    type: String,
    required: true
  },
  // userName: {
  //   type: String,
  //   required: true
  // },
  username: {                    
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  helpful: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
