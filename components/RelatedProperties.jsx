"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { Heart, Star, MapPin } from "lucide-react";
import toast from "react-hot-toast";

const RelatedPropertyCard = ({ property }) => {
  const { router, currency } = useAppContext();
  if (!property || property.visible === false) return null;

  const handleCardClick = () => {
    router.push(`/properties/${property._id}`);
    scrollTo(0, 0);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col w-[220px] cursor-pointer rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black hover:shadow-lg hover:scale-[1.02] transition-all overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-36 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <Image
          src={property.images?.[0] || "/placeholder.jpg"}
          alt={property.title || "Property"}
          fill
          className="object-cover"
        />
      </div>

      {/* Property Info */}
      <div className="p-3 flex flex-col flex-1 text-gray-900 dark:text-white">
        {/* Name */}
        <h3 className="text-sm font-semibold truncate">{property.title}</h3>

        {/* Location */}
        {property.address && (
          <p className="text-gray-400 text-xs flex items-center gap-1 mt-1">
            <MapPin size={12} /> {property.address}, {property.city}
          </p>
        )}

        {/* Type / Category */}
        <p className="text-xs text-gray-500 mt-1">
          {property.type} • {property.category}
        </p>

        {/* Bedrooms / Bathrooms */}
        <p className="text-xs text-gray-500 mt-1">
          {property.bedrooms} Bed • {property.bathrooms} Bath • {property.toilets} Toilet
        </p>

        {/* Price */}
        {property.price && (
          <p className="text-orange-500 font-semibold mt-2">
            {currency} {Number(property.price).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default RelatedPropertyCard;
