import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Contact from "@/models/Contact";

export async function PATCH(req, { params }) {
  const { id } = await params; // unwrap the Promise
  await connectDB();
  const body = await req.json();

  try {
    await Contact.findByIdAndUpdate(id, body);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params; // unwrap the Promise
  await connectDB();

  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "true";

  try {
    if (force) {
      await Contact.findByIdAndDelete(id);
    } else {
      await Contact.findByIdAndUpdate(id, { deleted: true });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

