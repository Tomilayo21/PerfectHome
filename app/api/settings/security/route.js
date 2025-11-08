import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import SecuritySettings from "@/models/SecuritySettings";

// GET user security settings
export async function GET() {
  try {
    await connectDB();
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await SecuritySettings.findOne({ userId });
    if (!settings) {
      // If no settings exist, create default
      settings = await SecuritySettings.create({ userId });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE security settings
export async function POST(req) {
  try {
    await connectDB();
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const settings = await SecuritySettings.findOneAndUpdate(
      { userId },
      { ...body },
      { new: true, upsert: true }
    );

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
