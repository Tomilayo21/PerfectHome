import connectDB from '@/config/db';
import Post from '@/models/Post';

export async function PUT(req, context) {
  await connectDB();

  const params = await context.params; 
  const body = await req.json();

  const post = await Post.findByIdAndUpdate(params.id, body, { new: true });

  return new Response(JSON.stringify({ post }), { status: 200 });
}

export async function DELETE(req, context) {
  await connectDB();

  const params = await context.params;

  await Post.findByIdAndDelete(params.id);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
