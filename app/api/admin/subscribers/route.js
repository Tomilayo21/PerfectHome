import connectDB from "@/config/db";
import Subscriber from "@/models/Subscriber";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
    // return NextResponse.json({ subscribers }, { status: 200 });
    return NextResponse.json(subscribers, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}
