import connectDB from "@/config/db";
import { requireAdmin } from "@/lib/authAdmin";
import About from "@/models/About";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ GET: Fetch all about entries (sorted by section & position)
export async function GET() {
  await connectDB();
  const abouts = await About.find().sort({ position: 1 });
  return NextResponse.json(abouts);
}

// ✅ POST: Create new "About" section (admin only)
export async function POST(request) {
  try {
    // 🔐 Require admin
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin; // unauthorized or forbidden

    const formData = await request.formData();
    const heading = formData.get("heading");
    const subheading = formData.get("subheading");
    const section = formData.get("section");
    const description = formData.get("description");
    const position = formData.get("position");
    const files = formData.getAll("images");

    // Existing images if editing
    const existingImages = JSON.parse(formData.get("existingImages") || "[]");

    // Validate and upload new files
    const validFiles = files.filter((file) =>
      ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)
    );

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

    await connectDB();
    const newAbout = await About.create({
      title: formData.get("title"),
      description,
      image: allImages,
      heading,
      subheading,
      section,
      position,
    });

    return NextResponse.json(newAbout, { status: 201 });
  } catch (error) {
    console.error("POST /about error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ PATCH: Update order/positions (admin only)
export async function PATCH(request) {
  try {
    // 🔐 Require admin
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin; // unauthorized or forbidden

    const updates = await request.json();
    await connectDB();

    const updatePromises = updates.map(({ _id, position }) =>
      About.findByIdAndUpdate(_id, { position })
    );

    await Promise.all(updatePromises);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /about error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
