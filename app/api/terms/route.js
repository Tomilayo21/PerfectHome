// // // app/api/legal/terms/route.js
// // import { NextResponse } from "next/server";
// // import { promises as fs } from "fs";
// // import path from "path";

// // const filePath = path.resolve(process.cwd(), "public/legal/terms.json");

// // export async function GET() {
// //   try {
// //     const file = await fs.readFile(filePath, "utf8");
// //     return NextResponse.json(JSON.parse(file));
// //   } catch (error) {
// //     return NextResponse.json({ content: "" }, { status: 200 });
// //   }
// // }

// // export async function POST(req) {
// //   const body = await req.json();
// //   try {
// //     await fs.writeFile(filePath, JSON.stringify(body, null, 2));
// //     return NextResponse.json({ message: "Terms saved successfully" });
// //   } catch (error) {
// //     return NextResponse.json({ error: "Failed to save" }, { status: 500 });
// //   }
// // }
// import { NextResponse } from "next/server";
// import connectDB from "@/config/db"; // Adjust if your path differs
// import Terms from "@/models/Terms";

// export async function GET() {
//   try {
//     await connectDB();
//     const terms = await Terms.findOne().sort({ createdAt: -1 });
//     return NextResponse.json(terms || { content: "" });
//   } catch (error) {
//     console.error("GET /api/terms error:", error);
//     return NextResponse.json({ error: "Failed to fetch terms" }, { status: 500 });
//   }
// }

// export async function POST(req) {
//   try {
//     await connectDB();
//     const body = await req.json();

//     if (!body.content) {
//       return NextResponse.json({ error: "Content is required" }, { status: 400 });
//     }

//     // Optionally clear older versions if you want a single document
//     await Terms.deleteMany();

//     const newTerms = new Terms({ content: body.content });
//     await newTerms.save();

//     return NextResponse.json(newTerms, { status: 201 });
//   } catch (error) {
//     console.error("POST /api/terms error:", error);
//     return NextResponse.json({ error: "Failed to save terms" }, { status: 500 });
//   }
// }














































import connectDB from "@/config/db";
import Terms from "@/models/Terms";

export async function GET(req) {
  await connectDB();
  const terms = await Terms.find().sort({ createdAt: -1 });
  return Response.json(terms);
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const term = await Terms.create(body);
  return Response.json(term);
}

export async function PUT(req) {
  await connectDB();
  const body = await req.json();
  const { id, title, content } = body;
  const updated = await Terms.findByIdAndUpdate(id, { title, content }, { new: true });
  return Response.json(updated);
}

export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await Terms.findByIdAndDelete(id);
  return Response.json({ success: true });
}
