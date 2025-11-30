import connectDB from '@/config/db';
import Post from '@/models/Post';


export async function GET(req, { params }){
await connectDB();
const { slug } = params;
const post = await Post.findOne({ slug, status: 'published' }).populate('author categories tags');
if (!post) return new Response(null, { status: 404 });
return new Response(JSON.stringify(post), { status: 200 });
}