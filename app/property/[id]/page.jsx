"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RelatedProperties from "@/components/RelatedProperties";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import {
  Bed,
  Bath,
  Toilet,
  Ruler,
  MapPin,
  Heart,
  ArrowRight,
  Tag,
  Home
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export default function PropertyPage() {
  const { id } = useParams();
  const router = useRouter();
  const { properties, addToFavorites, favorites, currency } = useAppContext();

  const [property, setProperty] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadProperty = async () => {
      try {
        if (properties?.length) {
          const found = properties.find((p) => p._id === id);
          if (found) {
            setProperty(found);
            setMainImage(found.images?.[0] || "/placeholder.jpg");
            setLiked(favorites?.some((fav) => fav._id === found._id));
            return;
          }
        }

        setLoading(true);
        const res = await fetch(`/api/property/${id}`);
        const data = await res.json();
        const fetched = data.property || data.data || data || null;

        if (fetched && fetched._id) {
          setProperty(fetched);
          setMainImage(fetched.images?.[0] || "/placeholder.jpg");
          setLiked(favorites?.some((fav) => fav._id === fetched._id));
        } else {
          toast.error("Property not found");
        }
      } catch (err) {
        console.error("Error loading property:", err);
        toast.error("Failed to fetch property");
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id, properties, favorites]);

  useEffect(() => {
    const navbar = document.getElementById("main-navbar");
    if (navbar) {
      const updateHeight = () => {
        const height = navbar.offsetHeight;
        document.documentElement.style.setProperty("--navbar-height", height + "px");
      };

      updateHeight();
      window.addEventListener("resize", updateHeight);

      return () => window.removeEventListener("resize", updateHeight);
    }
  }, []);

  const handleLike = () => {
    if (!property) return;
    setLiked((prev) => !prev);
    addToFavorites(property);
  };

    

  if (loading || !property) return <Loading />;

  const related = properties
    ?.filter(
      (p) =>
        p._id !== id &&
        (p.category === property.category || p.city === property.city)
    )
    ?.slice(0, 4);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-50 text-gray-900 dark:text-gray-100 pt-[calc(var(--navbar-height)+2rem)] pb-20">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          {/* --- Image Gallery --- */}
            <div className="grid md:grid-cols-[1.7fr_0.5fr] gap-4 rounded-md overflow-hidden">
                {/* --- Main Image --- */}
                <div className="relative rounded-xl overflow-hidden">
                    <Image
                    key={mainImage}
                    src={mainImage || "/placeholder.jpg"}
                    alt={property.title || "Property image"}
                    width={1200}
                    height={800}
                    priority
                    className="w-full h-[500px] object-cover rounded-md transition-transform duration-300 hover:scale-[1.02]"
                    />
                </div>

                {/* --- Thumbnails (Desktop) --- */}
                <div className="hidden md:flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-1 w-full">
                    {property?.images?.slice(0, 6)?.map((img, i) => (
                    <div
                        key={i}
                        onClick={() => setMainImage(img)}
                        className={`relative cursor-pointer overflow-hidden border rounded-md transition-all duration-300 ${
                        mainImage === img
                            ? "ring-2 ring-blue-500"
                            : "hover:ring-2 hover:ring-blue-300"
                        }`}
                    > 
                        <Image
                        src={img}
                        alt={`Thumbnail ${i}`}
                        width={300}
                        height={300}
                        className="w-full h-20 object-cover rounded-lg"
                        />
                    </div>
                    ))}
                </div>

                {/* --- Mobile Grid --- */}
                <div className="grid grid-cols-2 gap-3 md:hidden">
                    {property?.images?.slice(0, 6)?.map((img, i) => (
                    <div
                        key={i}
                        onClick={() => setMainImage(img)}
                        className={`relative cursor-pointer overflow-hidden border rounded-lg transition-all duration-300 ${
                        mainImage === img
                            ? "ring-2 ring-orange-500"
                            : "hover:ring-2 hover:ring-orange-300"
                        }`}
                    >
                        <Image
                        src={img}
                        alt={`Thumbnail ${i}`}
                        width={400}
                        height={400}
                        className="w-full h-32 object-cover rounded-lg"
                        />
                    </div>
                    ))}
                </div>
            </div>

            {/* --- Property Video Section --- */}
            {property?.videos?.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:gray-800">
                  {property.title} Video
                </h2>

                {/* 🎥 Property Video Section */}
                <div className="relative w-full aspect-video overflow-hidden shadow-md bg-black/10 dark:bg-gray-50 rounded-md flex items-center justify-center">
                  <video
                    key={property.videos[0]} // ensures re-render when video changes
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover rounded-xl"
                    poster={property.images?.[0] || "/video-thumbnail.jpg"}
                  >
                    <source src={property.videos[0]} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </section>
            )}

          {/* --- Property Header --- */}
          <section className="flex flex-col md:flex-row justify-between gap-4 md:gap-6 w-full p-4 bg-gray-50 dark:bg-gray-50">
            {/* Left: Title + Location */}
            <div className="flex flex-col gap-2 md:flex-1">
              {/* Property Title */}
              <h1 className="text-md sm:text-2xl font-semibold text-gray-900 dark:text-gray-900 uppercase leading-snug line-clamp-2">
                {property.title}
              </h1>

              {/* Location */}
              <div className="flex items-start text-gray-600 dark:text-gray-400 gap-2 mt-1">
                <MapPin size={18} className="text-blue-500 shrink-0 mt-1" />
                <div className="flex flex-col leading-tight break-words">
                  <span className="font-medium">
                    {[property.city, property.state].filter(Boolean).join(", ") || "Location unavailable"}
                  </span>
                  {property.address && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {property.address}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Price + Tags */}
            <div className="flex flex-col md:items-end gap-3 mt-2 md:mt-0">
              {/* Price */}
              <div className="bg-blue-600 text-white font-bold text-lg sm:text-xl px-4 py-2 rounded-md shadow-md w-max">
                {currency}{Number(property.price).toLocaleString()}
              </div>


              {/* Type & Category with Icons */}
              <div className="flex flex-wrap gap-2 mt-1">
                {property.type && (
                  <span className="flex items-center gap-1 bg-blue-100 text-blue-700/80 dark:bg-blue-700/90 dark:text-white text-sm font-medium px-3 py-1 rounded-md">
                    <Home size={16} /> {property.type}
                  </span>
                )}
                {property.category && (
                  <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white gray-300 text-sm font-medium px-3 py-1 rounded-md">
                    <Tag size={16} /> {property.category}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* --- Property Info --- */}
          <section className="bg-gray-50 dark:bg-gray-50 shadow-sm p-4 sm:p-6 rounded-md grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Property Description */}
            <div className="space-y-3">
              <h3 className="text-md sm:text-lg text-gray-900 text-justify dark:text-gray-900 font-medium uppercase">
                Property Description
              </h3>
              <pre className="whitespace-pre-line text-gray-700 dark:text-gray-700 leading-relaxed font-sans text-sm sm:text-base">
                {property.description}
              </pre>
            </div>

            {/* Property Features */}
            <div className="flex flex-col gap-4">
              <h3 className="text-md sm:text-lg text-gray-900 dark:text-gray-900 uppercase font-medium">
                Features
              </h3>

              <div className="flex flex-wrap gap-3 text-sm sm:text-base">
                {property.bedrooms > 0 && (
                  <div className="flex items-center text-gray-700 dark:text-gray-700 gap-2">
                    {/* <Bed size={16} /> */}
                    <span>{property.bedrooms} Bedrooms</span>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex items-center text-gray-700 dark:text-gray-700 gap-2">
                    {/* <Bath size={16} /> */}
                    <span>{property.bathrooms} Bathrooms</span>
                  </div>
                )}
                {property.toilets > 0 && (
                  <div className="flex items-center text-gray-700 dark:text-gray-700 gap-2">
                    {/* <Toilet size={16} /> */}
                    <span>{property.toilets} Toilets</span>
                  </div>
                )}
                {property.area > 0 && (
                  <div className="flex items-center text-gray-700 dark:text-gray-700 gap-2">
                    {/* <Ruler size={16} /> */}
                    <span>{property.area} m²</span>
                  </div>
                )}

                {/* Additional Features */}
                {Array.isArray(property.features) &&
                  property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-gray-700 dark:text-gray-700">{feature}</span>
                    </div>
                  ))}
              </div>
            </div>
          </section>


          {/* --- Buttons --- */}
          <div className="flex flex-wrap gap-4 mt-6">
            {/* <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg shadow-md transition ${
                liked
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              <Heart size={18} fill={liked ? "white" : "none"} />
              {liked ? "Saved" : "Save Property"}
            </button> */}

            <button
              onClick={() =>
                router.push(`/contact-agent?propertyId=${property._id}`)
              }
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-md shadow-md hover:bg-blue-700 transition"
            >
              Contact Agent <ArrowRight size={18} />
            </button>
          </div>

          {/* --- Related --- */}
          {related?.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-semibold mb-6">
                Related Properties
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {related.map((item) => (
                  <div
                    key={item._id}
                    className="hover:scale-[1.02] transition-transform duration-200"
                  >
                    <RelatedProperties product={item} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
