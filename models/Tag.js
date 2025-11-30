import mongoose from 'mongoose';
const TagSchema = new mongoose.Schema({ name: String, slug: String });
export default mongoose.models.Tag || mongoose.model('Tag', TagSchema);