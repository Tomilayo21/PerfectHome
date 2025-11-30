import connectDB from "@/config/db";
import ReturnPolicy from "@/models/ReturnPolicy";

export async function GET() {
  await connectDB();
  const policies = await ReturnPolicy.find().sort({ createdAt: -1 });
  return Response.json(policies);
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const newPolicy = await ReturnPolicy.create(body);
  return Response.json(newPolicy);
}

export async function PUT(req) {
  await connectDB();
  const { id, heading, subheading } = await req.json();
  const updated = await ReturnPolicy.findByIdAndUpdate(
    id,
    { heading, subheading },
    { new: true }
  );
  return Response.json(updated);
}

export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await ReturnPolicy.findByIdAndDelete(id);
  return Response.json({ success: true });
}
