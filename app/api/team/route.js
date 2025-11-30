import connectDB from "@/config/db";
import { requireAdmin } from "@/lib/authAdmin"; 
import Team from "@/models/Team";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ GET: Fetch all team entries (sorted by section & position)
export async function GET() {
  await connectDB();
  const teams = await Team.find().sort({ position: 1 });
  return NextResponse.json(teams);
}

// ✅ POST: Create new team entry
export async function POST(request) {
  try {
    // 🔐 Require admin authentication
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin; // If unauthorized or forbidden, return it directly

    const formData = await request.formData();
    const heading = formData.get("heading");
    const subheading = formData.get("subheading");
    const section = formData.get("section");
    const description = formData.get("description");
    const position = formData.get("position");
    const files = formData.getAll("images");

    const existingImages = JSON.parse(formData.get("existingImages") || "[]");

    // ✅ Validate file types
    const validFiles = files.filter((file) =>
      ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)
    );

    // ✅ Upload new files to Cloudinary
    const newUploadedImages = await Promise.all(
      validFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          stream.end(buffer);
        });
      })
    );

    const allImages = [...existingImages, ...newUploadedImages];

    // ✅ Save to MongoDB
    const newTeam = await Team.create({
      title: formData.get("title"),
      description,
      image: allImages,
      heading,
      subheading,
      section,
      position,
    });

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ PATCH: Update team positions (requires admin)
export async function PATCH(request) {
  try {
    // 🔐 Require admin
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const updates = await request.json();
    await connectDB();

    const updatePromises = updates.map(({ _id, position }) =>
      Team.findByIdAndUpdate(_id, { position })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
