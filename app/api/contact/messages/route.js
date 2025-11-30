// app/api/contact/messages/route.js
import connectDB from "@/config/db";
import Contact from "@/models/Contact";

export async function GET(req) {
  try {
    await connectDB();

    const messages = await Contact.find().sort({ createdAt: -1 });

    return new Response(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to load messages" }), { status: 500 });
  }
}
