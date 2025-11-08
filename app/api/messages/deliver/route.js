import connectDB from "@/config/db";
import Message from "@/models/Message";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";


export async function GET() {
  try {
    await connectDB();
    const messages = await Message.find().sort({ createdAt: 1 });
    return NextResponse.json(messages);
  } catch (err) {
    console.error("GET /api/messages error:", err); // 👈 this will show in your terminal
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();
  const { userId } = getAuth(req);
  const body = await req.json();
  const message = await Message.create({
    ...body,
    senderId: userId,
    read: false,
  });
  return NextResponse.json(message);
}
