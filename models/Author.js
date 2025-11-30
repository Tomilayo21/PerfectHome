import mongoose from 'mongoose';
const AuthorSchema = new mongoose.Schema({
name: String,
email: String,
bio: String,
image: String,
slug: String,
});
export default mongoose.models.Author || mongoose.model('Author', AuthorSchema);