import connectDB from "@/config/db";
import Post from "@/models/Post";
import User from "@/models/User";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdjustNavbarHeight from "@/components/AdjustNavbarHeight";


export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectDB();

  const post = await Post.findOne({ slug }).lean();
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
  };
}

export default async function SingleBlog({ params }) {
  const { slug } = await params;
  await connectDB();

  

  const post = await Post.findOne({ slug }).lean();
  if (!post) return notFound();

  // ⭐ FETCH AUTHOR FROM USERS COLLECTION
  const author = await User.findById(post.author).lean();

  // Fetch related
  const related = await Post.find({
    slug: { $ne: slug },
    categories: { $in: post.categories || [] },
  }).limit(3).lean();

  // Previous / next
  const prevPost = await Post.findOne({ _id: { $lt: post._id } }).sort({ _id: -1 }).lean();
  const nextPost = await Post.findOne({ _id: { $gt: post._id } }).sort({ _id: 1 }).lean();

  return (
    <>
        <Navbar />
        <AdjustNavbarHeight />
      <div className="bg-gray-50 mb-16">

        
        

        {/* ---------------- HERO SECTION ---------------- */}
        
        <div className="relative w-full mb-10 h-[380px] md:h-[480px] lg:h-[500px]">
          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Text container */}
          <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 max-w-full md:max-w-3xl text-white">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3 leading-tight">
              {post.title}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs sm:text-sm md:text-sm text-gray-200">
              <span>{post.readingTime} min read</span>
              <span>•</span>
              <span>By {author?.name || "Unknown Author"}</span>
              <span>•</span>
              <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3 md:mt-4">
              {post.tags?.map(tag => (
                <span
                  key={tag}
                  className="px-2 sm:px-3 py-1 bg-white/20 rounded-full text-[10px] sm:text-xs md:text-xs backdrop-blur"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>


        {/* CONTENT */}
        <div className="max-w-3xl mx-auto px-8">
          <div
            className="prose prose-lg dark:prose-invert text-justify max-w-none text-black leading-relaxedquill-content text-gray-700 dark:text-gray-700 whitespace-pre-wrap leading-relaxed prose dark:prose-invert max-w-full"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* AUTHOR BOX */}
        {/* <div className="max-w-3xl mx-auto mt-12 px-4">
          <div className="p-5 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-semibold">Author</h3>

            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {author?.name || "Unknown Author"}
            </p>

            {author?.imageUrl && (
              <img
                src={author.imageUrl}
                className="h-16 w-16 rounded-full mt-3 object-cover"
              />
            )}
          </div>
        </div> */}

          {/* PREV / NEXT */}
          <div className="max-w-3xl mx-auto mt-12 grid md:grid-cols-2 gap-6 px-4">
          {/* Previous Post */}
          {prevPost ? (
              <Link
              href={`/blog/${prevPost.slug}`}
              className="block border rounded-lg p-4 hover:shadow-lg transition"
              >
              <p className="text-sm text-gray-400 mb-1">← Previous</p>
              <p className="font-semibold text-gray-600">{prevPost.title}</p>
              <p className="text-gray-500 text-sm mt-2 line-clamp-2">{prevPost.excerpt}</p>
              </Link>
          ) : <div />}

          {/* Next Post */}
          {nextPost ? (
              <Link
              href={`/blog/${nextPost.slug}`}
              className="block border rounded-lg p-4 hover:shadow-lg transition"
              >
              <p className="text-sm text-gray-400 mb-1">Next →</p>
              <p className="font-semibold text-gray-600">{nextPost.title}</p>
              <p className="text-gray-500 text-sm mt-2 line-clamp-2">{nextPost.excerpt}</p>
              </Link>
          ) : <div />}
          </div>



        {/* RELATED POSTS */}
        {related.length > 0 && (
          <div className="max-w-5xl mx-auto mt-16 mb-16 px-4">
            <h3 className="text-2xl font-bold mb-6 text-black">Related Posts</h3>

            <div className="grid md:grid-cols-3 gap-6">
              {related.map(r => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="block border rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  {r.featuredImage && (
                    <img src={r.featuredImage} className="h-40 w-full object-cover" />
                  )}
                  <div className="p-4">
                    <p className="font-semibold text-black">{r.title}</p>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{r.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* COMMENTS */}
        {/* <div className="max-w-3xl mx-auto mt-20 px-4">
          <h3 className="text-2xl font-bold mb-4">Comments</h3>

          <textarea
            placeholder="Write a comment..."
            className="w-full border rounded-lg p-3 h-32 focus:outline-none focus:ring"
          />

          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg mt-4 hover:bg-blue-700">
            Submit Comment
          </button>
        </div> */}


      </div>
        <Footer />

    </>
  );
}
