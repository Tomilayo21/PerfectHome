import connectDB from "@/config/db";
import { requireAdmin } from "@/lib/authAdmin";
import Team from "@/models/Team";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // ✅ Check if user is an admin
    const adminUser = await requireAdmin(request);
    if (adminUser instanceof NextResponse) {
      // requireAdmin already returns a response when unauthorized
      return adminUser;
    }

    await connectDB();

    const { order } = await request.json();

    if (!Array.isArray(order)) {
      return NextResponse.json(
        { success: false, message: "Invalid order data" },
        { status: 400 }
      );
    }

    const bulkOps = order.map(({ id, position }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { position } },
      },
    }));

    await Team.bulkWrite(bulkOps);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating team order:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
