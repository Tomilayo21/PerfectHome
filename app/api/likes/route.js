// app/api/likes/route.js
import { NextResponse } from 'next/server';
import Product from '@/models/Product';
import connectDB from '@/config/db';

export async function PATCH(req) {
  try {
    await connectDB();
    
    const { productId, userId } = await req.json();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const alreadyLiked = product.likes.includes(userId);

    if (alreadyLiked) {
      product.likes = product.likes.filter(id => id !== userId);
    } else {
      product.likes.push(userId);
    }

    await product.save();

    return NextResponse.json({ liked: !alreadyLiked }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: 'Error updating likes', error: error.message },
      { status: 500 }
    );
  }
}
