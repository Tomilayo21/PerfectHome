"use client"
import Image from "next/image";
import Link from "next/link";

export default function BlogCard({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-md overflow-hidden border hover:shadow-md transition-shadow duration-300 bg-gray-50 dark:bg-gray-50"
    >
      {post.featuredImage && (
        <div className="relative w-full h-48">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-2">
          {post.categories?.map((cat) => (
            <span
              key={cat}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-sm"
            >
              {cat}
            </span>
          ))}
        </div>

        <h2 className="text-2xl text-black font-medium mb-2 group-hover:text-black transition-colors duration-300">
          {post.title}
        </h2>

        <p className="text-gray-600 dark:text-gray-600 text-justify mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex justify-between items-center text-gray-500 text-sm">
          <span>{post.author?.name || "Unknown Author"}</span>
          <span>{post.readingTime} min read</span>
        </div>

        <div className="mt-4">
          <span className="text-blue-600 font-medium hover:underline">
            Read More →
          </span>
        </div>
      </div>
    </Link>
  );
}
