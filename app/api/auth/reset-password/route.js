// import { NextResponse } from "next/server";
// import connectDB from "@/config/db";
// import bcrypt from "bcryptjs";
// import User from "@/models/User";
// import PasswordReset from "@/models/PasswordReset";

// export async function POST(req) {
//   try {
//     await connectDB();
//     const { token, password } = await req.json();
//     if (!token || !password)
//       return NextResponse.json({ error: "Token and new password required" }, { status: 400 });

//     // Find token
//     const resetRecord = await PasswordReset.findOne({
//       token,
//       expiresAt: { $gte: new Date() },
//     });

//     if (!resetRecord) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

//     // Hash new password
//     const passwordHash = await bcrypt.hash(password, 10);

//     // Update user (string _id safe)
//     await User.findByIdAndUpdate(resetRecord.userId, { passwordHash });

//     // Delete token
//     await PasswordReset.findByIdAndDelete(resetRecord._id);

//     return NextResponse.json({ success: true, message: "Password reset successfully" }, { status: 200 });
//   } catch (err) {
//     console.error("🔥 [RESET_PASSWORD_ERROR]", err);
//     return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
//   }
// }

















// app/reset-password/route.js

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/config/db";
import User from "@/models/User";

// Handle GET request (when user clicks email link)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Invalid or missing token" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    // ✅ Instead of JSON, redirect user to reset password form
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handle POST request (when user submits new password)
export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Missing token or new password" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Save new password & clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({ message: "Password reset successful" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
