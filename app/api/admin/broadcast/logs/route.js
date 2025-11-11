import connectDB from "@/config/db";
import Broadcast from "@/models/Broadcast";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  const broadcasts = await Broadcast.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Broadcast.countDocuments();

  return NextResponse.json({ broadcasts, total });
}

