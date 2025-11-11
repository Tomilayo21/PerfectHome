import connectDB from "@/config/db";
import Broadcast from "@/models/Broadcast";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// export async function POST(req) {
//   await connectDB();

//   try {
//     const { id, email } = await req.json();

//     if (!id || !email) {
//       return NextResponse.json({ error: "Missing broadcast ID or email" }, { status: 400 });
//     }

//     const broadcast = await Broadcast.findById(id);
//     if (!broadcast) {
//       return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
//     }

//     const recipient = broadcast.recipients.find((r) => r.email === email);
//     if (!recipient) {
//       return NextResponse.json({ error: "Recipient not found in broadcast" }, { status: 404 });
//     }

//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: parseInt(process.env.EMAIL_PORT),
//       secure: true,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const attachments = (broadcast.attachment || []).map((url, index) => ({
//       filename: url.split("/").pop(),
//       path: url,
//       cid: `attachment-${index}`,
//     }));

//     const attachmentsHtml = (broadcast.attachment || [])
//       .map((url, i) =>
//         url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)
//           ? `<img src="${url}" style="max-width:100%; height:auto;" />`
//           : `<p><a href="${url}" target="_blank">View Attachment ${i + 1}</a></p>`
//       )
//       .join("");

//     // Send email
//     await transporter.sendMail({
//       from: `"Cusceda NG" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: broadcast.subject,
//       html: `
//         <div style="padding: 20px; font-size: 16px;">
//           <h2>${broadcast.subject}</h2>
//           <p>${broadcast.message.replace(/\n/g, "<br>")}</p>
//           ${attachmentsHtml}
//           <p>Cheers,<br/>Cusceda NG Team</p>
//         </div>
//       `,
//       attachments,
//     });

//     // Update recipient status and time
//     await Broadcast.updateOne(
//       { _id: id, "recipients.email": email },
//       {
//         $set: {
//           "recipients.$.status": "sent",
//           "recipients.$.error": null,
//           "recipients.$.sentAt": new Date(), // ✅ Save time of delivery
//         },
//       }
//     );

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error("Resend failed:", err);

//     // Save failure reason
//     await Broadcast.updateOne(
//       { _id: id, "recipients.email": email },
//       {
//         $set: {
//           "recipients.$.status": "failed",
//           "recipients.$.error": err.message,
//         },
//       }
//     );

//     return NextResponse.json({ error: "Failed to resend email", details: err.message }, { status: 500 });
//   }
// }

export async function POST(req) {
  await connectDB();

  try {
    const { id, email } = await req.json();

    if (!id || !email) {
      return NextResponse.json({ error: "Missing broadcast ID or email" }, { status: 400 });
    }

    const broadcast = await Broadcast.findById(id);
    if (!broadcast) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    const recipient = broadcast.recipients.find((r) => r.email === email);
    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found in broadcast" }, { status: 404 });
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

    const attachments = (broadcast.attachment || []).map((url, index) => ({
      filename: `attachment-${index + 1}`,
      path: url,
      cid: url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) ? `inline-img-${index}` : undefined,
    }));

    const attachmentsHtml = (broadcast.attachment || [])
      .map((url, i) => {
        const isImage = url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);
        if (isImage) {
          return `<img src="${url}" style="max-width:100%; height:auto; margin-bottom: 10px;" alt="attachment" />`;
        } else {
          return `<p><a href="${url}" target="_blank" rel="noopener noreferrer">View Attachment ${i + 1}</a></p>`;
        }
      })
      .join("");

    await transporter.sendMail({
      from: `"Cusceda NG" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: broadcast.subject,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="padding: 30px 20px; color: #333333; font-size: 16px; line-height: 1.5;">
            <h2 style="color: #9CA3AF;">${broadcast.subject}</h2>
            <div style="white-space: pre-wrap;">${broadcast.message}</div>
            ${attachmentsHtml}
            <p>Cheers,<br/>The Cusceda NG Team</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888888;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Cusceda NG. All rights reserved.</p>
            <p style="margin: 5px 0 0;">If you did not subscribe to this newsletter, you can safely ignore this email.</p>
            <p style="margin: 10px 0 0;">
              You can unsubscribe
              <a href="https://quick-carty.vercel.app/unsubscribe?email=${encodeURIComponent(
                email
              )}" style="color: #0070f3; text-decoration: none;">here</a>
            </p>
          </div>
        </div>
      `,
      attachments,
    });

    await Broadcast.updateOne(
      { _id: id, "recipients.email": email },
      {
        $set: {
          "recipients.$.status": "sent",
          "recipients.$.error": null,
          "recipients.$.sentAt": new Date(), // Track delivery time
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resend failed:", err);

    await Broadcast.updateOne(
      { _id: id, "recipients.email": email },
      {
        $set: {
          "recipients.$.status": "failed",
          "recipients.$.error": err.message,
        },
      }
    );

    return NextResponse.json({ error: "Failed to resend email", details: err.message }, { status: 500 });
  }
}
