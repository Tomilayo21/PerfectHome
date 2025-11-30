import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import VisitorLog from "@/models/VisitorLog";

export async function POST(req) {
  try {
    await connectDB();
    const { event, path } = await req.json();

    // Basic IP capture
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    const log = new VisitorLog({
      ip,
      path,
      event,
    });
    await log.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Log error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
