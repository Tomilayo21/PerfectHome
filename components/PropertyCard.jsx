"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Bed, Bath, Ruler, Toilet, Tag } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

const PropertyCard = ({ property }) => {
  const router = useRouter();
  const { currency } = useAppContext()
  if (property.visible === false) return null;

  if (!property || property.visible === false) return null;

  const formattedLocation =
    property.city && property.state
      ? `${property.city}, ${property.state}`
      : property.location || "Location not available";

  return (
    <div
      onClick={() => router.push(`/property/${property._id}`)}
      className="group bg-white dark:bg-gray-900 overflow-hidden
      shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
    >
      {/* Property Image Section */}
      <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <Image
          src={property.images?.[0] || "/placeholder.jpg"}
          alt={property.title || "Property image"}
          width={400}
          height={400}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {property.type && (
          <span
            className={`absolute top-3 left-3 px-3 py-1 text-xs font-normal rounded-md text-black
              ${
                property.type === "Rent"
                  ? "bg-blue-300"
                  : property.type === "Sale"
                  ? "bg-gray-300"
                  : "bg-orange-600"
              }`}
          >
            {property.type}
          </span>
        )}

        <div className="absolute bottom-0 left-0 w-full p-3">
          <p className="text-lg font-medium text-black">
            {currency}{Number(property.price || 0).toLocaleString()}
            {property.type === "Rent" && (
              <span className="text-sm text-gray-900 font-normal"> / year</span>
            )}
          </p>
        </div>
      </div>
      
        {/* Property Media Section (Video or Image) */}
        {/* <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {property.videos?.[0] ? (
            <video
            src={property.videos[0]}
            controls={false}
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
        ) : (
            <Image
            src={property.images?.[0] || "/placeholder.jpg"}
            alt={property.title || "Property image"}
            width={400}
            height={400}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
        )}

        {property.type && (
            <span
            className={`absolute top-3 left-3 px-3 py-1 text-xs font-normal rounded-md text-black
                ${
                property.type === "Rent"
                    ? "bg-blue-300"
                    : property.type === "Sale"
                    ? "bg-gray-300"
                    : "bg-orange-600"
                }`}
            >
            {property.type}
            </span>
        )}

        
        <div className="absolute bottom-0 left-0 w-full p-3">
            <p className="text-lg font-medium text-black">
            {currency}
            {Number(property.price || 0).toLocaleString()}
            {property.type === "Rent" && (
                <span className="text-sm text-gray-900 font-normal"> / year</span>
            )}
            </p>
        </div>
        </div> */}

      {/* Property Info */}
      <div className="p-4 flex flex-col gap-3">
        {/* Title */}
        <h3 className="text-sm font-medium text-gray-800 dark:text-white uppercase leading-snug line-clamp-2">
        {property.title}
        </h3>


        {/* Category */}
        {property.category && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Tag size={14} className="mr-1" />
            <span className="capitalize">{property.category}</span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <MapPin size={14} className="mr-1 text-orange-500" />
          <span>{formattedLocation}</span>
        </div>

        {/* Features */}
        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1">
            <Bed size={16} />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={16} />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Toilet size={16} />
            <span>{property.toilets}</span>
          </div>
          {property.area > 0 && (
            <div className="flex items-center gap-1">
              <Ruler size={16} />
              <span>{property.area} sqft</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
