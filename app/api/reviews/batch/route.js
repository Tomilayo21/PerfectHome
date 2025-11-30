import connectDB from '@/config/db';
import Review from '@/models/Review';

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const ids = searchParams.get('ids')?.split(',') || [];

  try {
    const reviews = await Review.find({ productId: { $in: ids } });
    return Response.json(reviews);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
