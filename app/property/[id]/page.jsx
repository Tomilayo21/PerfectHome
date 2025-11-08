"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RelatedProducts from "@/components/RelatedProducts";
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
      <main className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 pt-8 mt-8 pb-20">
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
                    className="w-full h-[500px] object-cover rounded-xl transition-transform duration-300 hover:scale-[1.02]"
                    />
                </div>

                {/* --- Thumbnails (Desktop) --- */}
                <div className="hidden md:flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-1 w-full">
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
            <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                {property.title} Video
            </h2>

            {/* 🎥 Property Video Section */}
            <div className="relative w-full aspect-video overflow-hidden shadow-md bg-black/10 dark:bg-gray-800 rounded-xl flex items-center justify-center">
            {property?.videos && property.videos.length > 0 ? (
                <video
                key={property.videos[0]} // ensure re-render when video changes
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-cover rounded-xl"
                poster={property.images?.[0] || "/video-thumbnail.jpg"}
                >
                <source src={property.videos[0]} type="video/mp4" />
                Your browser does not support the video tag.
                </video>
            ) : (
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                Video coming soon...
                </span>
            )}
            </div>

            </section>





          {/* --- Property Header --- */}
          <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex flex-col gap-1">
                <h1 className="text-xl font-medium text-gray-800 dark:text-white uppercase leading-snug line-clamp-2">
                    {property.title}
                </h1>

                {/* ✅ Category Tag under Title */}
                {/* {property.category && (
                    <span className="inline-block bg-orange-100 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-md w-fit uppercase tracking-wide">
                    {property.category}
                    </span>
                )} */}
                </div>

              <div className="flex items-start text-gray-600 dark:text-gray-400">
                <MapPin size={18} className="mr-2 mt-1 text-orange-500 shrink-0" />
                <div className="flex flex-col leading-tight">
                    <span className="font-medium">
                    {[property.city, property.state].filter(Boolean).join(", ") ||
                        "Location unavailable"}
                    </span>
                    {property.address || property.country ? (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {[property.address].filter(Boolean).join(", ")}
                    </span>
                    ) : null}
                </div>
                </div>
            </div>

            <div className="flex flex-col items-end">
              <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-1">
                {currency}
                {Number(property.price).toLocaleString()}
              </h2>
              <div className="flex gap-2 mt-2">
                {property.type && (
                    <span className="bg-orange-100 text-orange-700 text-sm font-medium px-3 py-1 rounded-md">
                    {property.type}
                    </span>
                )}
                {property.category && (
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium px-3 py-1 rounded-md">
                    {property.category}
                    </span>
                )}
                </div>

            </div>
          </section>

          {/* --- Property Info --- */}
          <section className="bg-white dark:bg-gray-900 shadow-sm p-6 grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
            <h3 className="text-md font-medium uppercase">Property Description</h3>
            <pre className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
                {property.description}
            </pre>
            </div>

            

            <div className="flex flex-col gap-4">
            <h3 className="text-md uppercase font-medium">Features</h3>

            <div className="grid grid-cols-2 gap-3 text-sm">
                {property.bedrooms > 0 && (
                <div className="flex items-center gap-2">
                    {/* <Bed size={16} /> */}
                    <span>{property.bedrooms} Bedrooms</span>
                </div>
                )}
                {property.bathrooms > 0 && (
                <div className="flex items-center gap-2">
                    {/* <Bath size={16} /> */}
                    <span>{property.bathrooms} Bathrooms</span>
                </div>
                )}
                {property.toilets > 0 && (
                <div className="flex items-center gap-2">
                    {/* <Toilet size={16} /> */}
                    <span>{property.toilets} Toilets</span>
                </div>
                )}
                {property.area > 0 && (
                <div className="flex items-center gap-2">
                    {/* <Ruler size={16} /> */}
                    <span>{property.area} m²</span>
                </div>
                )}

                {/* ✅ Property Features (spaced evenly) */}
                {Array.isArray(property.features) &&
                property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                ))}
            </div>
            </div>

          </section>

          {/* --- Buttons --- */}
          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg shadow-md transition ${
                liked
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              <Heart size={18} fill={liked ? "white" : "none"} />
              {liked ? "Saved" : "Save Property"}
            </button>

            <button
              onClick={() =>
                router.push(`/contact-agent?propertyId=${property._id}`)
              }
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg shadow-md hover:bg-orange-700 transition"
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
                    <RelatedProducts product={item} />
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
