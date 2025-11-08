import { v2 as cloudinary } from 'cloudinary';
import Settings from '@/models/Settings';
import { writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import os from 'os';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get('file');
    const type = data.get('type'); // 'light' or 'dark'

    if (!file || !type) {
      return NextResponse.json({ error: 'File and type are required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempFilePath = path.join(os.tmpdir(), file.name);
    await writeFile(tempFilePath, buffer);

    const uploadRes = await cloudinary.uploader.upload(tempFilePath, {
      folder: 'site-logos',
    });

    await connectDB();

    const updateField =
      type === 'light'
        ? { lightLogoUrl: uploadRes.secure_url }
        : { darkLogoUrl: uploadRes.secure_url };

    await Settings.findOneAndUpdate({}, updateField, { upsert: true, new: true });

    return NextResponse.json({ success: true, ...updateField });
  } catch (err) {
    console.error('Upload Error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

