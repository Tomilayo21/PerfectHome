// app/api/partners/route.js (for example)

import connectDB from "@/config/db";
import Partner from "@/models/Partner";
import { requireAdmin } from "@/lib/authAdmin";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ GET all partners
export async function GET() {
  await connectDB();
  const partners = await Partner.find().sort({ position: 1 });
  return NextResponse.json(partners);
}

// ✅ POST - Add a new partner
export async function POST(request) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin; // not authorized

    await connectDB();

    // Parse multipart formData
    const formData = await request.formData();
    const username = formData.get("username");
    const name = formData.get("name");
    const comment = formData.get("comment");
    const files = formData.getAll("images");

    if (!username || !name || !comment) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Filter valid image files
    const validFiles = files.filter((file) =>
      ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)
    );

    // Upload to Cloudinary
    const uploadedImageUrls = await Promise.all(
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

    const newPartner = new Partner({
      username,
      name,
      comment,
      imageUrl: uploadedImageUrls,
      approved: false,
      position: 9999,
    });

    await newPartner.save();
    return NextResponse.json(newPartner, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ✅ PUT - Update a partner (details or approval)
export async function PUT(request) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    await connectDB();

    const contentType = request.headers.get("content-type") || "";

    // Case 1: multipart formData (update partner info)
    if (contentType.startsWith("multipart/form-data")) {
      const formData = await request.formData();
      const id = formData.get("id");
      const username = formData.get("username");
      const name = formData.get("name");
      const comment = formData.get("comment");
      const files = formData.getAll("images");
      const existingImages = JSON.parse(formData.get("existingImages") || "[]");

      if (!id || !username || !name || !comment) {
        return NextResponse.json({ message: "Missing fields" }, { status: 400 });
      }

      const validFiles = files.filter((file) =>
        ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)
      );

      const uploadedImageUrls = await Promise.all(
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

      const allImages = [...existingImages, ...uploadedImageUrls];

      const updated = await Partner.findByIdAndUpdate(
        id,
        { username, name, comment, imageUrl: allImages },
        { new: true }
      );

      if (!updated) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    // Case 2: JSON (toggle approval)
    const body = await request.json();
    if ("approved" in body && body.id) {
      const updated = await Partner.findByIdAndUpdate(
        body.id,
        { approved: body.approved },
        { new: true }
      );
      if (!updated) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    return NextResponse.json({ message: "Invalid PUT request" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ✅ PATCH - Update partner order
export async function PATCH(request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { order } = await request.json();
  if (!Array.isArray(order)) {
    return NextResponse.json({ message: "Invalid order data" }, { status: 400 });
  }

  await connectDB();

  const bulkOps = order.map(({ id, position }) => ({
    updateOne: { filter: { _id: id }, update: { position } },
  }));

  await Partner.bulkWrite(bulkOps);

  return NextResponse.json({ message: "Order updated" });
}

// ✅ DELETE - Delete a partner
export async function DELETE(request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ message: "Missing partner ID" }, { status: 400 });
  }

  await connectDB();
  await Partner.findByIdAndDelete(id);

  return NextResponse.json({ message: "Deleted" });
}
