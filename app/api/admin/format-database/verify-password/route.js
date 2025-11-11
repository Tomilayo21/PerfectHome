import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // Compare with ENV variable
    if (password !== process.env.ADMIN_DB_CLEAR_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({ message: "Password correct" }, { status: 200 });

  } catch (error) {
    console.error("Error verifying password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
