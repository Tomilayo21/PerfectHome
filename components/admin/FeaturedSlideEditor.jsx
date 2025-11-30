"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";

export default function FeaturedSlideEditor() {
  const { currency } = useAppContext();

  const [properties, setProperties] = useState([]);
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const [selectedId, setSelectedId] = useState("");
  const [snapshotPreview, setSnapshotPreview] = useState(null);

  // Form fields
  const [deal, setDeal] = useState("");
  const [sale, setSale] = useState("");
  const [offerEnd, setOfferEnd] = useState("");
  const [buttonText, setButtonText] = useState("View Property");
  const [buttonLink, setButtonLink] = useState("");
  const [overrideImg, setOverrideImg] = useState("");
  const [saving, setSaving] = useState(false);

  // Load properties
  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await fetch("/api/property/admin-list?page=1&limit=100");
        const json = await res.json();
        setProperties(json.properties || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load properties");
      }
    }
    loadProperties();
  }, []);

  // Load slides
  useEffect(() => {
    async function loadSlides() {
      try {
        const res = await fetch("/api/featured-slider");
        const json = await res.json();
        if (json.success) {
          setSlides(json.slides);
          if (json.slides.length > 0) setCurrentSlideIndex(0);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load slides");
      }
    }
    loadSlides();
  }, []);

  // Update form when selecting a slide from navigation
  useEffect(() => {
    if (!slides[currentSlideIndex]) return resetFormToSlide(null);
    resetFormToSlide(slides[currentSlideIndex]);
  }, [currentSlideIndex]);

  // Update snapshot preview when property changes
  useEffect(() => {
    if (!selectedId) {
      setSnapshotPreview(null);
      return;
    }

    const property = properties.find(p => p._id === selectedId);
    const existingSlide = slides.find(s => s.propertyId === selectedId);

    // If editing an existing slide
    if (existingSlide) {
      setSnapshotPreview(prev => ({
        title: existingSlide.snapshot?.title,
        price: existingSlide.snapshot?.price,
        location: existingSlide.snapshot?.location,
        imgSrc: overrideImg || prev?.imgSrc || existingSlide.overrideImg || existingSlide.snapshot?.imgSrc,
        bedrooms: existingSlide.snapshot?.bedrooms,
        bathrooms: existingSlide.snapshot?.bathrooms,
        category: existingSlide.snapshot?.category,
      }));
      return;
    }

    // NEW SLIDE (no existing one)
    if (property) {
      setSnapshotPreview({
        title: property.title,
        price: property.price,
        location: `${property.city}, ${property.state}`,
        imgSrc: overrideImg || property.images?.[0] || null,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        category: property.category,
      });

      setButtonLink(prev => prev || `/property/${selectedId}`);
    }
  }, [selectedId, properties, overrideImg, slides]);



  // Helper to reset form fields (new slide) or populate with existing slide
  const resetFormToSlide = (slide) => {
    if (!slide) {
      // new slide
      setSelectedId("");
      setDeal("");
      setSale("");
      setOfferEnd("");
      setButtonText("View Property");
      setButtonLink("");
      setOverrideImg("");
      setSnapshotPreview(null);
    } else {
      // existing slide
      setSelectedId(slide.propertyId || "");
      setDeal(slide.deal || "");
      setSale(slide.sale || "");
      setOfferEnd(slide.offerEnd ? new Date(slide.offerEnd).toISOString().slice(0,16) : "");
      setButtonText(slide.buttonText || "View Property");
      setButtonLink(slide.buttonLink || `/property/${slide.propertyId}`);
      setOverrideImg(slide.overrideImg || "");
      setSnapshotPreview({
        title: slide.snapshot?.title,
        price: slide.snapshot?.price,
        location: slide.snapshot?.location,
        imgSrc: slide.overrideImg || slide.snapshot?.imgSrc,
        bedrooms: slide.snapshot?.bedrooms,
        bathrooms: slide.snapshot?.bathrooms,
        category: slide.snapshot?.category,
      });
    }
  };

  const handlePropertyChange = (e) => {
    const newId = e.target.value;
    setSelectedId(newId);
  };


  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedId) return toast.error("Select a property first");
    setSaving(true);

    try {
      const payload = {
        propertyId: selectedId,
        deal,
        sale,
        offerEnd: offerEnd ? new Date(offerEnd).toISOString() : null,
        buttonText,
        buttonLink,
        overrideImg: overrideImg || null,
        position: currentSlideIndex,
      };

      const res = await fetch("/api/featured-slider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");

      // Update slides without refresh
      const updatedSlides = [...slides];
      const existingIndex = updatedSlides.findIndex(s => s.propertyId === selectedId);
      if (existingIndex > -1) {
        updatedSlides[existingIndex] = json.slide;
      } else {
        updatedSlides.push(json.slide);
        setCurrentSlideIndex(updatedSlides.length - 1);
      }

      setSlides(updatedSlides);
      toast.success("Slide saved");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!slides[currentSlideIndex]?._id) return;
    try {
      const res = await fetch(`/api/featured-slider?id=${slides[currentSlideIndex]._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Delete failed");

      const updatedSlides = slides.filter((_, i) => i !== currentSlideIndex);
      setSlides(updatedSlides);
      setCurrentSlideIndex(0);
      toast.success("Slide deleted");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <div className="bg-black p-4 sm:p-6 rounded-lg shadow max-w-full">
      <h3 className="text-lg sm:text-xl font-bold mb-4 text-white text-center sm:text-left">
        Featured Slider — Add / Edit
      </h3>

      {/* Slide navigation */}
      {slides.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          {slides.map((s, index) => (
            <button
              key={s._id}
              type="button"
              onClick={() => setCurrentSlideIndex(index)}
              className={`flex items-center gap-3 px-3 py-2 rounded-full transition-all duration-200 ${
                index === currentSlideIndex
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-105"
              }`}
            >
              {s.snapshot?.imgSrc ? (
                <img
                  src={s.snapshot.imgSrc}
                  alt={s.snapshot.title || "Slide"}
                  className="w-10 h-10 sm:w-10 sm:h-10 object-cover rounded-full border-2 border-gray-600"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-300">
                  N/A
                </div>
              )}
              <span className="truncate max-w-[100px] sm:max-w-[120px] text-sm">
                {s.snapshot?.title || "Untitled"}
              </span>
            </button>
          ))}
        </div>
      )}


      {/* Form */}
      <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
        {/* Property select */}
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-1">Select Property</label>
          <select
            value={selectedId}
            onChange={handlePropertyChange}
            className="w-full p-2 sm:p-3 border rounded bg-gray-900 text-white"
          >
            <option value="">— choose property —</option>
            {properties.map(p => (
              <option key={p._id} value={p._id}>
                {p.title} — ₦{Number(p.price).toLocaleString()} — {p.city}
              </option>
            ))}
          </select>
        </div>

        {/* Selected slide preview */}
        {snapshotPreview && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start bg-gray-900 p-3 rounded shadow-md border border-gray-700">
            {snapshotPreview.imgSrc ? (
              <img
                src={snapshotPreview.imgSrc}
                alt="preview"
                className="w-full sm:w-32 h-24 object-cover rounded-md"
              />
            ) : (
              <div className="w-full sm:w-32 h-24 bg-gray-800 rounded flex items-center justify-center text-gray-400">
                No image
              </div>
            )}
            <div className="flex-1 text-gray-200">
              <h4 className="font-semibold text-base sm:text-lg">{snapshotPreview.title}</h4>
              <p className="text-sm text-gray-400">{currency}{Number(snapshotPreview.price).toLocaleString()}</p>
              <p className="text-xs text-gray-500">{snapshotPreview.location}</p>
              <p className="text-xs mt-1">Beds: {snapshotPreview.bedrooms} | Baths: {snapshotPreview.bathrooms}</p>
              <p className="text-xs mt-1">Category: {snapshotPreview.category}</p>
            </div>
          </div>
        )}

        {/* Deal & Sale */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="p-2 border rounded" placeholder="Deal label" value={deal} onChange={e => setDeal(e.target.value)} />
          <input className="p-2 border rounded" placeholder="Sale text" value={sale} onChange={e => setSale(e.target.value)} />
        </div>

        {/* Offer end & Override image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="datetime-local" className="p-2 border rounded" value={offerEnd} onChange={e => setOfferEnd(e.target.value)} />
          <input className="p-2 border rounded" placeholder="Override image URL" value={overrideImg} onChange={e => setOverrideImg(e.target.value)} />
        </div>

        {/* Button text & link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="p-2 border rounded" placeholder="Button text" value={buttonText} onChange={e => setButtonText(e.target.value)} />
          <input className="p-2 border rounded" placeholder="Button link" value={buttonLink} onChange={e => setButtonLink(e.target.value)} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <button type="button" onClick={handleDelete} className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
            Delete Slide
          </button>
          <button type="submit" disabled={saving} className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            {saving ? "Saving..." : "Save Featured Slide"}
          </button>
        </div>
      </form>
    </div>

  );
}
