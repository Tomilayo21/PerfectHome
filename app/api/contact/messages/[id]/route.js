import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Contact from "@/models/Contact";

export async function PATCH(req, { params }) {
  await connectDB();
  const body = await req.json();

  try {
    await Contact.findByIdAndUpdate(params.id, body);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "true";

  try {
    if (force) {
      // Permanently delete the message
      await Contact.findByIdAndDelete(params.id);
    } else {
      // Soft delete: mark as deleted
      await Contact.findByIdAndUpdate(params.id, { deleted: true });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
