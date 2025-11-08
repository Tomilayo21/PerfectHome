// import connectDB from "@/config/db";
// import Message from "@/models/Message";
// import { NextResponse } from "next/server";
// import { getAuth } from "@clerk/nextjs/server";


// export async function GET() {
//   try {
//     await connectDB();
//     const messages = await Message.find().sort({ createdAt: 1 });
//     return NextResponse.json(messages);
//   } catch (err) {
//     console.error("GET /api/messages error:", err); // 👈 this will show in your terminal
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// export async function POST(req) {
//   await connectDB();
//   const { userId } = getAuth(req);
//   const body = await req.json();
//   const message = await Message.create({
//     ...body,
//     senderId: userId,
//     read: false,
//   });
//   return NextResponse.json(message);
// }









import connectDB from "@/config/db";
import Message from "@/models/Message";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    await connectDB();
    const { userId } = getAuth(req);

    // detect if request is FormData
    const contentType = req.headers.get("content-type") || "";
    let messageData = { senderId: userId, read: false };

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const chatId = formData.get("chatId");
      const text = formData.get("text");

      // handle multiple files
      const files = formData.getAll("files");
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          const upload = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "chat_uploads" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(buffer);
          });
          return upload.secure_url;
        })
      );

      messageData = {
        ...messageData,
        chatId,
        text,
        attachments: uploadedUrls,
      };
    } else {
      // JSON body
      const body = await req.json();
      messageData = { ...messageData, ...body };
    }

    const message = await Message.create(messageData);
    return NextResponse.json(message);
  } catch (err) {
    console.error("POST /api/messages error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const messages = await Message.find().sort({ createdAt: 1 });
    return NextResponse.json(messages);
  } catch (err) {
    console.error("GET /api/messages error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// export async function POST(req) {
//   await connectDB();
//   const { userId } = getAuth(req);
//   if (!userId) return NextResponse.json({ message: "Not authorized" }, { status: 403 });

//   // Set up multer to read uploaded files
//   const storage = multer.memoryStorage();
//   const upload = multer({ storage }).any(); // accept any files

//   return new Promise((resolve, reject) => {
//     upload(req, {}, async (err) => {
//       if (err) return reject(NextResponse.json({ message: err.message }, { status: 500 }));

//       try {
//         const isFormData = req.headers.get("content-type")?.includes("multipart/form-data");

//         if (isFormData) {
//           // Handle file uploads
//           const chatId = req.body.get("chatId");
//           const files = req.files || [];

//           const uploadedUrls = await Promise.all(
//             files.map((file) =>
//               new Promise((res, rej) => {
//                 const stream = cloudinary.uploader.upload_stream(
//                   { resource_type: "auto" },
//                   (error, result) => (error ? rej(error) : res(result.secure_url))
//                 );
//                 stream.end(file.buffer);
//               })
//             )
//           );

//           const messages = await Promise.all(
//             uploadedUrls.map((url) =>
//               Message.create({
//                 senderId: userId,
//                 senderName: "Admin", // change as needed
//                 content: url,
//                 chatId,
//                 isAdmin: true,
//                 read: false,
//                 status: "sent",
//               })
//             )
//           );

//           resolve(NextResponse.json(messages, { status: 201 }));
//         } else {
//           // Handle normal text message
//           const body = await req.json();
//           const message = await Message.create({
//             ...body,
//             senderId: userId,
//             read: false,
//           });
//           resolve(NextResponse.json(message, { status: 201 }));
//         }
//       } catch (error) {
//         console.error(error);
//         reject(NextResponse.json({ message: error.message }, { status: 500 }));
//       }
//     });
//   });
// }
