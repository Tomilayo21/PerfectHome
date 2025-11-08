import connectDB from "@/config/db";
import { requireAdmin } from "@/lib/authAdmin";
import About from "@/models/About";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // ✅ Check if the user is an admin
    const adminUser = await requireAdmin(request);
    if (adminUser instanceof NextResponse) {
      // If requireAdmin returned a NextResponse (unauthorized or forbidden), return it directly
      return adminUser;
    }

    // ✅ Connect to database
    await connectDB();

    const { order } = await request.json();

    const bulkOps = order.map(({ id, position }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { position } },
      },
    }));

    await About.bulkWrite(bulkOps);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating About order:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
