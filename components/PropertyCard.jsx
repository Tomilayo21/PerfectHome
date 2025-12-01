// "use client";

// import React from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { MapPin, Bed, Bath, Ruler, Toilet, Tag } from "lucide-react";
// import { useAppContext } from "@/context/AppContext";

// const PropertyCard = ({ property }) => {
//   const router = useRouter();
//   const { currency } = useAppContext()
//   if (property.visible === false) return null;

//   if (!property || property.visible === false) return null;

//   const formattedLocation =
//     property.city && property.state
//       ? `${property.city}, ${property.state}`
//       : property.location || "Location not available";

//   return (
//     <div
//       onClick={() => router.push(`/property/${property._id}`)}
//       className="group bg-white bg-blue-50 overflow-hidden
//       shadow-sm rounded-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
//     >
//       {/* Property Image Section */}
//       <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
//         <Image
//           src={property.images?.[0] || "/placeholder.jpg"}
//           alt={property.title || "Property image"}
//           width={400}
//           height={400}
//           className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//         />

//         {property.type && (
//           <span
//             className={`absolute top-3 left-3 px-3 py-1 text-xs font-normal rounded-md text-black
//               ${
//                 property.type === "Rent"
//                   ? "bg-blue-300"
//                   : property.type === "Sale"
//                   ? "bg-gray-300"
//                   : "bg-orange-600"
//               }`}
//           >
//             {property.type}
//           </span>
//         )}

//         <div className="absolute bottom-0 left-0 w-full p-3">
//           <p className="text-lg font-medium text-black">
//             {currency}{Number(property.price || 0).toLocaleString()}
//             {property.type === "Rent" && (
//               <span className="text-sm text-gray-900 font-normal"> / year</span>
//             )}
//           </p>
//         </div>
//       </div>
      
//         {/* Property Media Section (Video or Image) */}
//         {/* <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 overflow-hidden">
//         {property.videos?.[0] ? (
//             <video
//             src={property.videos[0]}
//             controls={false}
//             muted
//             loop
//             autoPlay
//             playsInline
//             preload="metadata"
//             className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//             />
//         ) : (
//             <Image
//             src={property.images?.[0] || "/placeholder.jpg"}
//             alt={property.title || "Property image"}
//             width={400}
//             height={400}
//             className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//             />
//         )}

//         {property.type && (
//             <span
//             className={`absolute top-3 left-3 px-3 py-1 text-xs font-normal rounded-md text-black
//                 ${
//                 property.type === "Rent"
//                     ? "bg-blue-300"
//                     : property.type === "Sale"
//                     ? "bg-gray-300"
//                     : "bg-orange-600"
//                 }`}
//             >
//             {property.type}
//             </span>
//         )}

        
//         <div className="absolute bottom-0 left-0 w-full p-3">
//             <p className="text-lg font-medium text-black">
//             {currency}
//             {Number(property.price || 0).toLocaleString()}
//             {property.type === "Rent" && (
//                 <span className="text-sm text-gray-900 font-normal"> / year</span>
//             )}
//             </p>
//         </div>
//         </div> */}

//       {/* Property Info */}
//       <div className="p-4 flex flex-col gap-3">
//         {/* Title */}
//         <h3 className="text-sm font-medium text-gray-800 uppercase leading-snug line-clamp-2">
//         {property.title}
//         </h3>


//         {/* Category */}
//         {property.category && (
//           <div className="flex items-center text-sm text-gray-500 ">
//             <Tag size={14} className="mr-1" />
//             <span className="capitalize">{property.category}</span>
//           </div>
//         )}

//         {/* Location */}
//         <div className="flex items-center text-sm text-gray-500">
//           <MapPin size={14} className="mr-1 text-blue-500" />
//           <span>{formattedLocation}</span>
//         </div>

//         {/* Features */}
//         <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
//           <div className="flex items-center gap-1">
//             <Bed size={16} />
//             <span>{property.bedrooms}</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <Bath size={16} />
//             <span>{property.bathrooms}</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <Toilet size={16} />
//             <span>{property.toilets}</span>
//           </div>
//           {property.area > 0 && (
//             <div className="flex items-center gap-1">
//               <Ruler size={16} />
//               <span>{property.area} sqft</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PropertyCard;
































































































"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Bed, Bath, Ruler, Toilet, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/context/AppContext";

const swipeConfidenceThreshold = 1000;
const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

const PropertyCard = ({ property }) => {
  const router = useRouter();
  const { currency } = useAppContext();
  const [currentImage, setCurrentImage] = useState(0);
  const [direction, setDirection] = useState(0); // 1 = next, -1 = prev

  if (!property || property.visible === false) return null;

  const images = property.images?.length > 0 ? property.images : ["/placeholder.jpg"];

  const nextImage = () => {
    setDirection(1);
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDragEnd = (event, info) => {
    const swipe = swipePower(info.offset.x, info.velocity.x);
    if (swipe < -swipeConfidenceThreshold) nextImage();
    else if (swipe > swipeConfidenceThreshold) prevImage();
  };

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
  };

  const formattedLocation =
    property.city && property.state
      ? `${property.city}, ${property.state}`
      : property.location || "Location not available";

  return (
    <div
      className="group bg-white overflow-hidden shadow-sm rounded-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
      onClick={() => router.push(`/property/${property._id}`)}
    >
      {/* Image Carousel */}
      <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={currentImage}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute inset-0"
          >
            <Image
              src={images[currentImage]}
              alt={property.title || "Property image"}
              fill
              className="object-cover w-full h-full"
            />
          </motion.div>
        </AnimatePresence>

        {/* Carousel Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/60 transition z-10"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/60 transition z-10"
            >
              ›
            </button>
          </>
        )}

        {/* Type Badge */}
        {property.type && (
          <span
            className={`absolute top-3 left-3 px-3 py-1 text-xs font-normal rounded-md text-black
              ${property.type === "Rent"
                ? "bg-blue-300"
                : property.type === "Sale"
                ? "bg-gray-300"
                : "bg-orange-600"
              }`}
          >
            {property.type}
          </span>
        )}

        {/* Price Tag */}
        <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-lg font-medium text-white">
            {currency}{Number(property.price || 0).toLocaleString()}
            {property.type === "Rent" && <span className="text-sm text-white font-normal"> / year</span>}
          </p>
        </div>
      </div>

      {/* Property Info */}
      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-sm font-medium text-gray-800 uppercase leading-snug line-clamp-2">
          {property.title}
        </h3>

        {property.category && (
          <div className="flex items-center text-sm text-gray-500">
            <Tag size={14} className="mr-1" />
            <span className="capitalize">{property.category}</span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-500">
          <MapPin size={14} className="mr-1 text-blue-500" />
          <span>{formattedLocation}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
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
