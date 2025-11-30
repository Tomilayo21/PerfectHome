import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Property from "@/models/Property";

export async function GET(req) {
  try {
    await connectDB();

    const { search, type, sort, page = 1, limit = 10 } = Object.fromEntries(
      new URL(req.url).searchParams
    );

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (type) query.type = type;

    const sortOption =
      sort === "price-asc"
        ? { price: 1 }
        : sort === "price-desc"
        ? { price: -1 }
        : sort === "newest"
        ? { createdAt: -1 }
        : { createdAt: 1 };

    const properties = await Property.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Property.countDocuments(query);

    return NextResponse.json({ success: true, properties, total });
  } catch (err) {
    console.error("Admin Property Fetch Error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load properties" },
      { status: 500 }
    );
  }
}
