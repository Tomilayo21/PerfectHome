"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import BlogEditor from "@/components/admin/BlogEditor";


export default function AdminBlogPage() {
  const [posts, setPosts] = useState([]);
  const [openEditor, setOpenEditor] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);

  const load = async () => {
    const res = await axios.get("/api/blog?limit=50");
    setPosts(res.data.posts);
  };

  const remove = async (id) => {
    if (!confirm("Delete this post?")) return;
    await axios.delete(`/api/blog/${id}`);
    load();
  };

  const openEditModal = (post) => {
    setCurrentPost(post);
    setOpenEditor(true);
  };

  const closeModal = () => {
    setOpenEditor(false);
    setCurrentPost(null);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">

      {/* New Post Button */}
      <button
        onClick={() => openEditModal(null)}
        className="px-4 py-2 bg-black text-white rounded"
      >
        New Post
      </button>

      {/* POSTS LIST */}
      <div className="mt-6 space-y-4">
        {posts.map((p) => (
          <div
            key={p._id}
            className="p-4 border rounded flex justify-between items-center bg-black"
          >
            <div>
              <p className="font-bold">{p.title}</p>
              <p className="text-sm text-gray-500">{p.slug}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openEditModal(p)}
                className="px-3 py-1 border rounded"
              >
                Edit
              </button>
              <button
                onClick={() => remove(p._id)}
                className="px-3 py-1 border rounded text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 EDITOR MODAL */}
        {openEditor && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white max-w-3xl w-full rounded-lg shadow-xl p-6 animate-fadeIn relative">
            {/* Close button */}
            <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
            >
                ✕
            </button>

            <h2 className="text-2xl font-semibold mb-4 text-black">
                {currentPost ? "Edit Post" : "New Post"}
            </h2>

            <BlogEditor initial={currentPost} onSaved={closeModal} />
            </div>
        </div>
        )}


    </div>
  );
}
