import connectDB from "@/config/db";
import Review from "@/models/Review";

export async function PATCH(req, { params }) {
  await connectDB();

  const { id } = params; // ✅ use params, not req.query
  const { approved } = await req.json();

  try {
    const updated = await Review.findByIdAndUpdate(
      id,
      { approved },
      { new: true }
    );

    if (!updated) {
      return new Response(
        JSON.stringify({ message: "Review not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Error updating review" }),
      { status: 500 }
    );
  }
}
