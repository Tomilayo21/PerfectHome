import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import VisitorLog from "@/models/VisitorLog";

export async function POST(req) {
  try {
    await connectDB();

    const { path, event } = await req.json();

    // Get IP + UserAgent
    const ip =
      req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Save log
    await VisitorLog.create({
      ip,
      userAgent,
      path,
      event: event || "page_view",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error logging visitor:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
