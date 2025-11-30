import mongoose from 'mongoose';
const CommentSchema = new mongoose.Schema({
post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
name: String,
email: String,
content: String,
approved: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);