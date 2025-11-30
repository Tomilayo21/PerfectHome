"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { useSession } from "next-auth/react";
import slugify from "slugify";
import DOMPurify from "dompurify";
import "react-quill-new/dist/quill.snow.css";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const countWords = (html) => {
  if (!html) return 0;
  const text = html.replace(/<[^>]+>/g, "").trim();
  return text ? text.split(/\s+/).length : 0;
};

const seoScore = (title, metaDesc) => {
  let score = 0;
  if (title.length >= 30 && title.length <= 60) score += 50;
  if (metaDesc.length >= 70 && metaDesc.length <= 160) score += 50;
  return score;
};

export default function BlogEditor({ initial = null, onSaved }) {
  const { data: session } = useSession();
  const quillRef = useRef(null);

  const [title, setTitle] = useState(initial?.title || "");
  const [content, setContent] = useState(initial?.content || "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(
    initial?.metaDescription || ""
  );
  const [featuredImage, setFeaturedImage] = useState(
    initial?.featuredImage || ""
  );
  const [categories, setCategories] = useState(
    initial?.categories?.join(", ") || ""
  );
  const [tags, setTags] = useState(initial?.tags?.join(", ") || "");
  const [loading, setLoading] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

  const slug = slugify(title, { lower: true, strict: true });
  const [postId, setPostId] = useState(initial?._id || null);
  const [publishState, setPublishState] = useState("Publish");


  const clearForm = () => {
    setTitle("");
    setContent("");
    setExcerpt("");
    setMetaTitle("");
    setMetaDescription("");
    setFeaturedImage("");
    setCategories("");
    setTags("");
    setPostId(null);
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    // ❌ Prevent auto-save for brand new posts until first manual save
    if (!postId) return;

    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    const timer = setTimeout(() => {
      save("draft", true); // auto-save
    }, 5000);

    setAutoSaveTimer(timer);
    return () => clearTimeout(timer);
  }, [
    title,
    content,
    excerpt,
    metaTitle,
    metaDescription,
    categories,
    tags,
    postId,
  ]);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || "");
      setContent(initial.content || "");
      setExcerpt(initial.excerpt || "");
      setMetaTitle(initial.metaTitle || "");
      setMetaDescription(initial.metaDescription || "");
      setFeaturedImage(initial.featuredImage || "");
      setCategories(initial.categories?.join(", ") || "");
      setTags(initial.tags?.join(", ") || "");
    } else {
      // New post
      setTitle("");
      setContent("");
      setExcerpt("");
      setMetaTitle("");
      setMetaDescription("");
      setFeaturedImage("");
      setCategories("");
      setTags("");
    }
  }, [initial]);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post("/api/blog/upload", formData);
        const quill = quillRef.current?.getEditor();
        if (!quill) return;
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", res.data.url);
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    };
  }, []);

  const save = async (status = "published", isAuto = false) => {
    if (!session?.user?.id) return;
    if (!title.trim()) return;

    if (!isAuto) {
      setLoading(true);

      if (status === "published") {
        setPublishState("Publishing...");
      }
    }

    const payload = {
      title,
      content,
      excerpt,
      metaTitle,
      metaDescription,
      featuredImage,
      status,
      slug,
      author: session.user.id,
      categories: categories.split(",").map((c) => c.trim()),
      tags: tags.split(",").map((t) => t.trim()),
    };

    try {
      // ----------------------------------------------------
      // UPDATE EXISTING POST
      // ----------------------------------------------------
      if (postId) {
        await axios.put(`/api/blog/${postId}`, payload);

        if (!isAuto) {
          if (status === "published") {
            toast.custom(
              (t) => (
                <div
                  className={`${
                    t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
                  } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
                >
                  <CheckCircle className="text-green-500" size={22} />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Post updated successfully!
                  </p>
                </div>
              ),
              { duration: 3000, position: "top-right" }
            );

            setPublishState("Published ✓");
            setTimeout(() => setPublishState("Publish"), 2000);
          } else {
            // draft update toast
            toast.custom(
              (t) => (
                <div
                  className={`${
                    t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
                  } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
                >
                  <CheckCircle className="text-green-500" size={22} />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Draft updated
                  </p>
                </div>
              ),
              { duration: 2500, position: "top-right" }
            );
          }
        }

        if (!isAuto && onSaved) onSaved();
        setLoading(false);
        return;
      }

      // ----------------------------------------------------
      // CREATE NEW POST
      // ----------------------------------------------------
      const res = await axios.post("/api/blog", payload);
      setPostId(res.data.post._id);

      if (!isAuto) {
        if (status === "published") {
          clearForm();

          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
                } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
              >
                <CheckCircle className="text-green-500" size={22} />
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Post published successfully!
                </p>
              </div>
            ),
            { duration: 3000, position: "top-right" }
          );

          setPublishState("Published ✓");
          setTimeout(() => setPublishState("Publish"), 2000);
        } else {
          // draft created toast
          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
                } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
              >
                <CheckCircle className="text-green-500" size={22} />
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Draft saved
                </p>
              </div>
            ),
            { duration: 2500, position: "top-right" }
          );
        }
      }

      if (!isAuto && onSaved) onSaved();

    } catch (error) {
      console.error("Save error:", error);

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
          >
            <XCircle className="text-red-500" size={22} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {error.response?.data?.message ||
                error.message ||
                "Error saving post"}
            </p>
          </div>
        ),
        { duration: 3000, position: "top-right" }
      );
    }

    setLoading(false);
  };


  const inputClass =
    "w-full p-2 border border-gray-300 rounded text-white placeholder:text-white bg-black";


  return (
    <div className="space-y-6 mt-8">
      {/* Title & Excerpt */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className={inputClass}
      />
      <input
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Excerpt"
        className={inputClass}
      />

      {/* Quill Editor */}
      <div className="border border-gray-300 rounded overflow-hidden max-w-full">
        <ReactQuill
          ref={quillRef}
          key={initial?._id || "new"}
          value={content}
          onChange={setContent}
          theme="snow"
          modules={{
            toolbar: {
              container: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image"],
                ["clean"],
              ],
              handlers: {
                image: handleImageUpload,
              },
            },
          }}
          formats={["header", "bold", "italic", "underline", "strike", "list", "link", "image"]}
          className="min-h-[200px] max-h-[500px] overflow-y-auto bg-black !text-white"
        />
      </div>

      {/* Word count & SEO */}
      <div className="flex justify-between items-center text-gray-500 text-sm">
        <p>Word count: {countWords(content)}</p>
        <p>SEO Score: {seoScore(title, metaDescription)}%</p>
      </div>

      {/* Categories & Tags */}
      <input
        value={categories}
        onChange={(e) => setCategories(e.target.value)}
        placeholder="Categories (comma separated)"
        className={inputClass}
      />
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma separated)"
        className={inputClass}
      />

      {/* Featured Image */}
      <div className="space-y-2">
        <p className="font-semibold text-white">Featured Image</p>
        {featuredImage && (
          <img src={featuredImage} alt="Featured" className="w-48 rounded" />
        )}
        <input
          type="file"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append("file", file);
            const res = await axios.post("/api/blog/upload", formData);
            setFeaturedImage(res.data.url);
          }}
          className="text-white"
        />
      </div>

      {/* Meta fields */}
      <input
        value={metaTitle}
        onChange={(e) => setMetaTitle(e.target.value)}
        placeholder="Meta title"
        className={inputClass}
      />
      <input
        value={metaDescription}
        onChange={(e) => setMetaDescription(e.target.value)}
        placeholder="Meta description"
        className={inputClass}
      />

      {/* Live Preview */}
      <div className="border p-4 rounded bg-black dark:bg-black">
        <h3 className="font-semibold mb-2 text-white">Live Preview</h3>
        <div
          className="prose max-w-full text-white bg-black p-4 rounded"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={() => save("draft")}
          className="px-3 py-2 rounded bg-gray-400 text-white"
        >
          Save Draft
        </button>
        <button
          disabled={loading}
          onClick={() => save("published")}
          className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {publishState}
        </button>

      </div>
    </div>
  );
}
