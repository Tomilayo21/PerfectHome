import { NextResponse } from "next/server";

export async function POST(req) {
  const { password } = await req.json();

  const correctPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!password || password !== correctPassword) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
