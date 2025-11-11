import connectDB from "@/config/db";
import Broadcast from "@/models/Broadcast";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const now = new Date();

  const dueBroadcasts = await Broadcast.find({
    status: "scheduled",
    scheduledFor: { $lte: now },
  });

  if (dueBroadcasts.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let totalSent = 0;

  for (const broadcast of dueBroadcasts) {
    const recipientResults = [];

    const attachments = [];
    const inlineImages = [];
    const urls = Array.isArray(broadcast.attachment)
      ? broadcast.attachment
      : broadcast.attachment
      ? [broadcast.attachment]
      : [];

    urls.forEach((url, i) => {
      const fileName = url.split("/").pop() || `file-${i}`;
      const isImage = /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(fileName);

      attachments.push({
        filename: fileName,
        path: url,
        ...(isImage ? { cid: `inline-img-${i}` } : {}),
      });

      if (isImage) {
        inlineImages.push(`<img src="cid:inline-img-${i}" style="max-width:100%; height:auto;" />`);
      }
    });

    const html = `
      <p>${broadcast.message}</p>
      ${inlineImages.join("<br/>")}
    `;

    for (const recipient of broadcast.recipients) {
      const email = recipient.email || recipient;

      try {
        await transporter.sendMail({
          from: `"Cusceda NG" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: broadcast.subject,
          html,
          attachments,
        });

        recipientResults.push({ email, status: "sent" });
        totalSent++;
      } catch (err) {
        recipientResults.push({ email, status: "failed", error: err.message });
      }
    }

    await Broadcast.findByIdAndUpdate(broadcast._id, {
      status: "sent",
      recipients: recipientResults,
      sentAt: new Date(),
    });
  }

  return NextResponse.json({ sent: totalSent });
}
