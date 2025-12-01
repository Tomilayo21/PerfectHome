// "use client";

// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { useAppContext } from "@/context/AppContext";
// import { Heart, Star, MapPin } from "lucide-react";
// import toast from "react-hot-toast";

// const RelatedPropertyCard = ({ property }) => {
//   const { router, currency } = useAppContext();
//   if (!property || property.visible === false) return null;

//   const handleCardClick = () => {
//     router.push(`/property/${property._id}`);
//     scrollTo(0, 0);
//   };

//   return (
//     <div
//       onClick={handleCardClick}
//       className="group cursor-pointer rounded-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-white shadow-sm hover:shadow-md transform transition-all duration-300 overflow-hidden w-full sm:w-[180px] md:w-[220px]"
//     >
//       {/* Image */}
//       <div className="relative h-40 w-full overflow-hidden">
//         <Image
//           src={property.images?.[0] || "/placeholder.jpg"}
//           alt={property.title || "Property"}
//           fill
//           className="object-cover group-hover:scale-105 transition-transform duration-300"
//         />
//         {/* Price Tag Overlay */}
//         {property.price && (
//           <div className="absolute top-2 right-2 bg-blue-600/80 text-white text-xs font-medium px-3 py-1 rounded-md shadow">
//             {currency} {Number(property.price).toLocaleString()}
//           </div>
//         )}
//       </div>

//       {/* Property Info */}
//       <div className="p-4 flex flex-col gap-1">
//         {/* Name */}
//         <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white truncate">
//           {property.title}
//         </h3>

//         {/* Location */}
//         {property.address && (
//           <p className="flex items-center gap-1 text-gray-500 text-xs md:text-sm">
//             <MapPin size={12} className="text-blue-500" /> {property.address}, {property.city}
//           </p>
//         )}

//         {/* Type / Category Badge */}
//         <div className="flex flex-wrap gap-2 mt-1">
//           {property.type && (
//             <span className="text-xs md:text-sm bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">
//               {property.type}
//             </span>
//           )}
//           {property.category && (
//             <span className="text-xs md:text-sm bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-full">
//               {property.category}
//             </span>
//           )}
//         </div>

//         {/* Bedrooms / Bathrooms */}
//         <p className="text-gray-500 text-xs md:text-sm mt-1">
//           {property.bedrooms} Bed • {property.bathrooms} Bath • {property.toilets} Toilet
//         </p>

//         {/* Optional Action / CTA */}
//         <button className="mt-2 w-full text-center bg-blue-600 text-white text-xs md:text-sm font-medium rounded-md py-1.5 hover:bg-blue-700 transition">
//           View Details
//         </button>
//       </div>
//     </div>

//   );
// };

// export default RelatedPropertyCard;



































"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ContactAgentButton from "./ContactAgentButton"; 
import { useAppContext } from "@/context/AppContext";

const swipeConfidenceThreshold = 1000; // tweak this to control flick sensitivity
const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

const RelatedPropertyCard = ({ property }) => {
  const [hovered, setHovered] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [direction, setDirection] = useState(0); // 1 = next, -1 = prev
  const { router, currency } = useAppContext();

  if (!property || property.visible === false) return null;

  const handleCardClick = () => {
    window.location.href = `/property/${property._id}`;
    window.scrollTo(0, 0);
  };

  const images = property.images?.length > 0 ? property.images : ["/placeholder.jpg"];

  const nextImage = () => {
    setDirection(1);
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  // Handle drag/swipe with inertia
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

  return (
    <div
      className="group relative w-full sm:w-[180px] md:w-[220px] cursor-pointer rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Carousel */}
      <div className="relative h-40 w-full overflow-hidden">
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
            dragElastic={1} // allow full swipe effect
            onDragEnd={handleDragEnd}
            className="absolute inset-0"
          >
            <Image
              src={images[currentImage]}
              alt={property.title || "Property"}
              fill
              className="object-cover"
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

        {/* Price Tag */}
        {property.price && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-md shadow z-10">
            {currency} {Number(property.price).toLocaleString()}
          </div>
        )}

        {/* Hover Overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center gap-2 p-2 pointer-events-none"
            >
              <div className="flex flex-col gap-2 pointer-events-auto w-full items-center">
                <button
                  onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                  className="bg-white text-black px-4 py-1 rounded-md font-medium hover:bg-gray-200 transition"
                >
                  View Details
                </button>
                <ContactAgentButton property={property} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Property Info */}
      <div className="p-3 flex flex-col gap-1">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white truncate">
          {property.title}
        </h3>

        {property.address && (
          <p className="flex items-center gap-1 text-gray-500 text-xs md:text-sm">
            <MapPin size={12} className="text-blue-500" /> {property.address}, {property.city}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-1">
          {property.type && (
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs md:text-sm bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full"
            >
              {property.type}
            </motion.span>
          )}
          {property.category && (
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs md:text-sm bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-full"
            >
              {property.category}
            </motion.span>
          )}
        </div>

        <p className="text-gray-500 text-xs md:text-sm mt-1">
          {property.bedrooms} Bed • {property.bathrooms} Bath • {property.toilets} Toilet
        </p>
      </div>
    </div>
  );
};

export default RelatedPropertyCard;
