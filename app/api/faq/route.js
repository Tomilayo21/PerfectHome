






import connectDB from "@/config/db";
import FAQ from "@/models/FAQ";

export async function GET(req) {
  await connectDB();
  const faqs = await FAQ.find().sort({ createdAt: -1 });
  return Response.json(faqs);
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const faq = await FAQ.create(body);
  return Response.json(faq);
}

export async function PUT(req) {
  await connectDB();
  const body = await req.json();
  const { id, question, answer } = body;
  const updated = await FAQ.findByIdAndUpdate(id, { question, answer }, { new: true });
  return Response.json(updated);
}

export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await FAQ.findByIdAndDelete(id);
  return Response.json({ success: true });
}
