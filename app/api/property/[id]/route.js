import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Property from "@/models/Property";
import { requireAdmin } from "@/lib/authAdmin";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// ✅ Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Utility to stream buffers
function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

// Ensure Node.js runtime for streaming uploads
export const runtime = "nodejs";

/* =========================
   📦 GET — Public
========================= */
export async function GET(req, { params }) {
  await connectDB();

  try {
    const { id } = await params; // ✅ unwrap the promise
    const property = await Property.findById(id);

    if (!property)
      return NextResponse.json({ message: "Property not found" }, { status: 404 });

    return NextResponse.json({ success: true, property });
  } catch (err) {
    console.error("PROPERTY_FETCH_ERROR:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

/* =========================
   ❌ DELETE — Admin only
========================= */
export async function DELETE(req, { params }) {
  await connectDB();

  const adminUser = await requireAdmin(req);
  if (adminUser instanceof NextResponse) return adminUser;

  try {
    const { id } = await params; // ✅ unwrap the promise
    const deleted = await Property.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Property deleted" });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

/* =========================
   👁 PATCH — Toggle visibility
========================= */
export async function PATCH(req, { params }) {
  await connectDB();

  const adminUser = await requireAdmin(req);
  if (adminUser instanceof NextResponse) return adminUser;

  const { id } = await params; // ✅ unwrap
  const body = await req.json();

  try {
    if (typeof body.visible === "boolean") {
      const property = await Property.findById(id);
      if (!property)
        return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

      property.visible = body.visible;
      await property.save();

      return NextResponse.json({
        success: true,
        message: `Property visibility set to ${property.visible}`,
        property,
      });
    }

    return NextResponse.json({ success: false, message: "Missing 'visible' field" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

/* =========================
   ✏️ PUT — Edit property (Admin only)
========================= */
export async function PUT(req, { params }) {
  await connectDB();

  const adminUser = await requireAdmin(req);
  if (adminUser instanceof NextResponse) return adminUser;

  const { id } = await params; // ✅ unwrap

  try {
    const contentType = req.headers.get("content-type");

    // 📄 JSON update
    if (contentType?.includes("application/json")) {
      const data = await req.json();
      const updated = await Property.findByIdAndUpdate(id, data, { new: true });
      if (!updated)
        return NextResponse.json({ success: false, message: "Property not found" }, { status: 404 });

      return NextResponse.json({ success: true, property: updated });
    }

    // 📦 multipart/form-data (files)
    const formData = await req.formData();

    const updates = {
      title: formData.get("title"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      type: formData.get("type"),
      category: formData.get("category"),
      bedrooms: Number(formData.get("bedrooms")),
      bathrooms: Number(formData.get("bathrooms")),
      toilets: Number(formData.get("toilets")),
      area: Number(formData.get("area")),
      country: formData.get("country"),
      state: formData.get("state"),
      city: formData.get("city"),
      address: formData.get("address"),
      visible: formData.get("visible") === "true",
    };

    const existingImages = JSON.parse(formData.get("existingImages") || "[]");
    const newImages = formData.getAll("newImages");
    const newVideos = formData.getAll("newVideos");

    const uploadedImageUrls = [];
    const uploadedVideoUrls = [];

    // Upload images
    for (const file of newImages) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const stream = bufferToStream(buffer);

      const result = await new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          { folder: "properties/images", resource_type: "image" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.pipe(upload);
      });

      uploadedImageUrls.push(result.secure_url);
    }

    // Upload videos
    for (const file of newVideos) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const stream = bufferToStream(buffer);

      const result = await new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          { folder: "properties/videos", resource_type: "video" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.pipe(upload);
      });

      uploadedVideoUrls.push(result.secure_url);
    }

    // Merge updates
    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      {
        ...updates,
        images: [...existingImages, ...uploadedImageUrls],
        $push: { videos: { $each: uploadedVideoUrls } },
      },
      { new: true }
    );

    if (!updatedProperty)
      return NextResponse.json({ success: false, message: "Property not found" }, { status: 404 });

    return NextResponse.json({ success: true, property: updatedProperty });
  } catch (err) {
    console.error("PROPERTY_UPDATE_ERROR:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
