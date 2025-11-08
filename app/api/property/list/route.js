import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Property from "@/models/Property";


export async function GET() {
  try {
    await connectDB();

    const properties = await Property.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(properties, { status: 200 });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { message: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
