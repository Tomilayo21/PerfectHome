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

// ✅ DELETE About section (admin only)
export async function DELETE(req, { params }) {
  await connectDB();

  // 🔒 Require admin
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  // Unwrap params
  const { id } = await params;

  try {
    const deleted = await About.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ UPDATE About section (admin only)
export async function PUT(req, { params }) {
  await connectDB();

  // 🔑 unwrap the id
  const { id } = await params;

  // Require admin
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const formData = await req.formData();
    const heading = formData.get("heading");
    const subheading = formData.get("subheading");
    const section = formData.get("section");
    const description = formData.get("description");
    const position = formData.get("position");

    const files = formData.getAll("images");
    const existingImages = JSON.parse(formData.get("existingImages") || "[]");

    // ✅ Validate file types
    const validFiles = files.filter(file =>
      ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)
    );

    // ✅ Upload new images to Cloudinary
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

    // Merge old + new
    const allImages = [...existingImages, ...newUploadedImages];

    // ✅ Update in DB
    const updated = await About.findByIdAndUpdate(
      id,
      {
        heading,
        subheading,
        section,
        description,
        position,
        image: allImages,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Error updating About entry:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

