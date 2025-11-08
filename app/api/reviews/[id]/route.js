// import connectDB from '@/lib/connectDB';
import connectDB from '@/config/db';
import Review from '@/models/Review';

export async function GET(req, { params }) {
  await connectDB();

  const reviews = await Review.find({ productId: params.productId, approved: true }).sort({ createdAt: -1 });

  return new Response(JSON.stringify(reviews), { status: 200 });
}
