"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";


const HeroVideoSettings = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [width, setWidth] = useState("100%");
  const [height, setHeight] = useState("120vh");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const loadSettings = async () => {
      const res = await fetch("/api/hero-video");
      const data = await res.json();

      if (data.heroVideo) {
        setVideoUrl(data.heroVideo.videoUrl || "");
        setWidth(data.heroVideo.width || "100%");
        setHeight(data.heroVideo.height || "120vh");
      }

      setLoading(false);
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    const formData = new FormData();
    formData.append("width", width);
    formData.append("height", height);

    if (file) formData.append("video", file);
    else formData.append("videoUrl", videoUrl);

    try {
      const res = await fetch("/api/hero-video", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        setSaving(false);
        return;
      }

      toast.success("Hero video updated!");
    } catch (err) {
      toast.error("Network error");
    }

    setSaving(false);
  };


  if (loading) return <p>Loading…</p>;

  return (
    <div className="space-y-6">

      {/* VIDEO UPLOAD FIELD */}
      <div className="space-y-2">
        <label className="block font-medium">Hero Video</label>

        {/* File Input */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            onChange={(e) => {
              const selected = e.target.files[0];

              if (!selected) return;

              // 200MB limit
              if (selected.size > 200 * 1024 * 1024) {
                alert("Video is too large! Maximum size is 200MB.");
                return;
              }

              setFile(selected);
              setUploadProgress(0);

              const url = URL.createObjectURL(selected);
              setPreviewUrl(url);
            }}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
          />
        </div>

        {/* Remove Button */}
        {(file || previewUrl || videoUrl) && (
          <button
            onClick={() => {
              setFile(null);
              setPreviewUrl(null);
              setVideoUrl("");
            }}
            className="text-red-600 text-sm font-medium underline"
          >
            Remove Video
          </button>
        )}

        {/* Preview */}
        {(previewUrl || videoUrl) && (
          <div className="mt-3 flex justify-center">
            <video
              src={previewUrl || videoUrl}
              controls
              className="w-[250px] sm:w-[400px] md:w-[600px] rounded-lg shadow"
            />
          </div>
        )}


        {/* Progress Bar */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full h-2 mt-2 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: uploadProgress + "%" }}
            ></div>
          </div>
        )}
      </div>

      {/* Width */}
      <div>
        <label className="block font-medium mb-1">Width</label>
        <input
          type="text"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {/* Height */}
      <div>
        <label className="block font-medium mb-1">Height</label>
        <input
          type="text"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
};

export default HeroVideoSettings;
