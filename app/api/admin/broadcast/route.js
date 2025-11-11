import connectDB from "@/config/db";
import Subscriber from "@/models/Subscriber";
import Broadcast from "@/models/Broadcast";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import nodemailer from "nodemailer";

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function bufferToStream(buffer) {
  return new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
}

async function uploadToCloudinary(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder: "broadcast_attachments", resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    bufferToStream(buffer).pipe(upload);
  });
}

export async function POST(req) {
  await connectDB();

  const form = await req.formData();
  const subject = form.get("subject");
  const message = form.get("message");
  const scheduledFor = form.get("scheduledFor");
  const files = form.getAll("attachment");

  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message required" }, { status: 400 });
  }

  const subscribers = await Subscriber.find();
  if (subscribers.length === 0) {
    return NextResponse.json({ error: "No subscribers found" }, { status: 404 });
  }

  const recipientEmails = subscribers.map((s) => s.email);

  const uploadedFiles = [];

  // Upload each file to Cloudinary
  for (const file of files) {
    if (typeof file.name === "string") {
      try {
        const uploaded = await uploadToCloudinary(file);
        uploadedFiles.push({
          url: uploaded.secure_url,
          name: uploaded.original_filename,
          type: uploaded.resource_type,
          mime: file.type,
          isImage: /image\/(jpeg|jpg|png|gif|webp|svg)/.test(file.type),
        });
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
  }

  // If scheduled, store only the URLs for later sending
  if (scheduledFor) {
    await Broadcast.create({
      subject,
      message,
      attachment: uploadedFiles.map(f => f.url),
      recipients: recipientEmails.map(email => ({ email, status: "scheduled" })),
      status: "scheduled",
      // scheduledFor: new Date(scheduledFor),
      scheduledFor: new Date(Date.now() - 1000)
    });

    return NextResponse.json({ success: true, scheduled: true });
  }

  // Create mail transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Build nodemailer attachments
  const attachments = uploadedFiles.map((file, index) => ({
    filename: file.name,
    path: file.url,
    ...(file.isImage ? { cid: `inline-img-${index}` } : {}), // only add cid for inline images
  }));

  // Build attachments HTML for the email body (inline images and links)
  const attachmentsHtml = uploadedFiles.map((att, index) => {
    if (att.isImage) {
      // Display inline images using cid
      return `<img src="cid:inline-img-${index}" alt="${att.name}" style="max-width:100%; height:auto; margin-bottom: 10px;" />`;
    } else {
      // Display other files as links
      return `<p><a href="${att.url}" target="_blank" rel="noopener noreferrer">${att.name}</a></p>`;
    }
  }).join("");

  const results = [];

  for (const email of recipientEmails) {
    try {
      await transporter.sendMail({
        from: `"Cusceda NG" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
            <!-- Body -->
            <div style="padding: 30px 20px; color: #333333; font-size: 16px; line-height: 1.5;">
              <h2 style="color: #9CA3AF;">${subject}</h2>
              <div style="white-space: pre-wrap;">${message}</div>

              ${attachmentsHtml}

              <p>Cheers,<br/>The Cusceda NG Team</p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888888;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Cusceda NG. All rights reserved.</p>
              <p style="margin: 5px 0 0;">
                If you did not subscribe to this newsletter, you can safely ignore this email.
              </p>
              <p style="margin: 10px 0 0;">
                You can unsubscribe
                <a href="https://quick-carty.vercel.app/unsubscribe?email=${encodeURIComponent(email)}" style="color: #0070f3; text-decoration: none;">here</a>
              </p>
            </div>
          </div>
        `,
        attachments,
      });

      results.push({ email, status: "sent" });
    } catch (err) {
      console.error("Failed to send email to:", email, err.message);
      results.push({ email, status: "failed", error: err.message });
    }
  }

  await Broadcast.create({
    subject,
    message,
    attachment: uploadedFiles.map(f => f.url),
    recipients: results,
    status: "sent",
  });

  return NextResponse.json({ success: true, results });
}
