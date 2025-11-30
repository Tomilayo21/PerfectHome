import  connectDB  from "@/config/db";
import Privacy from "@/models/Privacy";

export async function GET(request) {
  await connectDB();
  const data = await Privacy.find();
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request) {
  await connectDB();
  const { heading, subheading } = await request.json();
  const created = await Privacy.create({ heading, subheading });
  return new Response(JSON.stringify(created), { status: 201 });
}

export async function PUT(request) {
  await connectDB();
  const { id, heading, subheading } = await request.json();
  const updated = await Privacy.findByIdAndUpdate(id, { heading, subheading }, { new: true });
  return new Response(JSON.stringify(updated), { status: 200 });
}

export async function DELETE(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  await Privacy.findByIdAndDelete(id);
  return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
}
