// app/api/reviews/helpful/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Review from "@/models/Review";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function PATCH(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = await req.json();

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const hasLiked = review.helpful.includes(userId);

    if (hasLiked) {
      review.helpful = review.helpful.filter(id => id !== userId);
    } else {
      review.helpful.push(userId);
    }

    await review.save();

    return NextResponse.json({ helpful: review.helpful }, { status: 200 });
  } catch (error) {
    console.error("Helpful Review Error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
