import connectDB from "@/config/db";
import Review from "@/models/Review";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { requireAdmin } from "@/lib/authAdmin";

// ✅ Handle review submission (users)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const { productId, rating, comment, username } = await request.json();
    if (!productId || !rating || !comment) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const userId = session.user.id;
    const existing = await Review.findOne({ productId, userId });

    if (existing) {
      return NextResponse.json({ message: "You already submitted a review" }, { status: 400 });
    }

    const review = new Review({
      productId,
      userId,
      username,
      rating,
      comment,
      approved: false,
    });

    await review.save();

    return NextResponse.json({ message: "Review submitted for approval" }, { status: 201 });
  } catch (error) {
    console.error("POST Review Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ✅ Handle review updates (admin only)
export async function PATCH(request) {
  try {
    // 🔐 Enforce admin authentication
    const adminUser = await requireAdmin(request);
    if (adminUser instanceof NextResponse) {
      // requireAdmin() already returned a NextResponse error (401/403)
      return adminUser;
    }

    await connectDB();

    const { order } = await request.json(); // e.g. [{ id: "reviewId", position: 0 }]
    if (!Array.isArray(order)) {
      return NextResponse.json({ success: false, message: "Invalid order data" }, { status: 400 });
    }

    const bulkOps = order.map(({ id, position }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { position } },
      },
    }));

    await Review.bulkWrite(bulkOps);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH Review Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
