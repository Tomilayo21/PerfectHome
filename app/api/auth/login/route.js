// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";
import { comparePassword } from "@/utils/auth";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // ❌ Block login if not verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Email not verified. Please check your inbox." },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
  success: true,
  token,
  user: {
    _id: user._id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    cartItems: user.cartItems || {}
  }
});

  } catch (err) {
    console.error("🔥 [LOGIN_ERROR]", err);
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 });
  }
}
