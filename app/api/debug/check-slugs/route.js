import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Post from "@/models/Post";

// GET /api/debug/check-slugs?slug=your-slug
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || null;

    // If user requests a specific slug
    if (slug) {
      const posts = await Post.find({ slug });

      return NextResponse.json({
        slugChecked: slug,
        foundCount: posts.length,
        posts,
      });
    }

    // Otherwise: scan ALL slugs for duplicates
    const allPosts = await Post.find().select("slug title _id");

    // Map slugs + count occurrences
    const slugMap = {};
    allPosts.forEach((p) => {
      slugMap[p.slug] = slugMap[p.slug] ? [...slugMap[p.slug], p] : [p];
    });

    // Filter duplicates
    const duplicates = Object.values(slugMap).filter((arr) => arr.length > 1);

    return NextResponse.json({
      totalPosts: allPosts.length,
      duplicateGroups: duplicates.length,
      duplicates,
    });

  } catch (err) {
    console.error("Slug debug error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
