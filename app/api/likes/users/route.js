import connectDB from "@/config/db";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { userIds } = await request.json();
    if (!Array.isArray(userIds)) {
      return NextResponse.json({ success: false, message: "Invalid userIds array" }, { status: 400 });
    }

    const users = await User.find({ _id: { $in: userIds } });

    const filtered = users.map(u => ({
      id: u._id,
      fullName: u.name || 'Anonymous',
      email: u.email || '',
      image: u.imageUrl || '',
      username: u.username || '',
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ success: true, users: filtered });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch user data' }, { status: 500 });
  }
}
