import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function GET() {
  try {
    // 🔥 Get current user session from NextAuth
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    await connectDB();

    // 🔥 Find user by next-auth ID (your model stores it as: _id)
    const localUser = await User.findById(userId);

    if (!localUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { role: localUser.role },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
