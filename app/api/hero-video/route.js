import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import HeroVideo from "@/models/HeroVideo";
import { v2 as cloudinary } from "cloudinary";

export const maxDuration = 300;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    await connectDB();
    const video = await HeroVideo.findOne();
    return NextResponse.json({ success: true, heroVideo: video || null });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const width = formData.get("width");
    const height = formData.get("height");
    const videoUrl = formData.get("videoUrl");
    const file = formData.get("video"); // File uploaded

    let cloudVideoUrl = videoUrl;

    // If file uploaded → upload to cloudinary
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "hero-video",
            resource_type: "video",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      cloudVideoUrl = uploadResult.secure_url;
    }

    let existing = await HeroVideo.findOne();

    if (existing) {
      existing.videoUrl = cloudVideoUrl;
      existing.width = width;
      existing.height = height;
      await existing.save();
    } else {
      existing = await HeroVideo.create({
        videoUrl: cloudVideoUrl,
        width,
        height,
      });
    }

    return NextResponse.json({ success: true, heroVideo: existing });
  } catch (err) {
    console.error("HERO VIDEO UPLOAD ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
