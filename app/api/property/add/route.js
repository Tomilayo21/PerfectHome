import connectDB from "@/config/db";
import Property from "@/models/Property";
import { requireAdmin } from "@/lib/authAdmin";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// ✅ Extend timeout for image uploads (Vercel/self-host)
export const maxDuration = 300;

// ✅ Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    // ✅ Authenticate admin
    const adminUser = await requireAdmin(request);
    if (adminUser instanceof NextResponse) return adminUser;
    if (!adminUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();

    // ✅ Extract form fields
    const title = formData.get("title");
    const description = formData.get("description");
    const price = formData.get("price");
    const type = formData.get("type");
    const bedrooms = formData.get("bedrooms");
    const bathrooms = formData.get("bathrooms");
    const toilets = formData.get("toilets");
    const area = formData.get("area");
    const country = formData.get("country");
    const state = formData.get("state");
    const city = formData.get("city");
    const address = formData.get("address");
    const category = formData.get("category");

    // ✅ Parse and validate features
    let features = [];
    try {
      features = JSON.parse(formData.get("features") || "[]");
      if (!Array.isArray(features)) features = [];
    } catch {
      features = [];
    }

    // ✅ Validate required fields
    if (
      !title ||
      !description ||
      !price ||
      !country ||
      !state ||
      !city ||
      !address ||
      !category
    ) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (features.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please add at least one feature." },
        { status: 400 }
      );
    }

    const files = formData.getAll("images");
    if (!files?.length) {
      return NextResponse.json(
        { success: false, message: "Please upload at least one image." },
        { status: 400 }
      );
    }

    // ✅ Upload to Cloudinary with 15s timeout per file
    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "properties", resource_type: "image" },
          (error, result) => {
            clearTimeout(timeout);
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
    });

    const settled = await Promise.allSettled(uploadPromises);
    const imageUrls = settled
      .filter((r) => r.status === "fulfilled" && r.value?.secure_url)
      .map((r) => r.value.secure_url);

    if (imageUrls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "All image uploads failed. Try again with smaller files.",
        },
        { status: 500 }
      );
    }

    // ✅ Handle video uploads
    const videoFiles = formData.getAll("videos");

    let videoUrls = [];
    if (videoFiles && videoFiles.length > 0) {
    const videoPromises = videoFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "properties/videos", resource_type: "video" },
            (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
            }
        );
        stream.end(buffer);
        });
    });

    videoUrls = await Promise.all(videoPromises);
    }


    // ✅ Save property
    await connectDB();

    const newProperty = await Property.create({
      userId: adminUser.id,
      title,
      description,
      price: Number(price),
      type,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      toilets: Number(toilets) || 0,
      area: Number(area) || 0,
      country,
      state,
      city,
      address,
      category,
      features, 
      images: imageUrls,
      videos: videoUrls,
    });

    return NextResponse.json({
      success: true,
      message: `Property uploaded successfully with ${imageUrls.length}/${files.length} images!`,
      property: newProperty,
    });
  } catch (error) {
    console.error("[PROPERTY_UPLOAD_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Property upload failed." },
      { status: 500 }
    );
  }
}
