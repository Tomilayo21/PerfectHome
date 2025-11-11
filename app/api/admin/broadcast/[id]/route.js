import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Broadcast from "@/models/Broadcast";

export async function DELETE(req, { params }) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "true";

  try {
    if (force) {
      // Permanently delete the message
      await Broadcast.findByIdAndDelete(params.id);
    } else {
      // Soft delete: mark as deleted
      await Broadcast.findByIdAndUpdate(params.id, { deleted: true });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
