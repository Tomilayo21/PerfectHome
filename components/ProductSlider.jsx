"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";

const ProductSlider = () => {
  const featuredProperties = [
    {
      id: 1,
      title: "Luxury 5-Bedroom Duplex in Ikate, Lekki",
      deal: "Limited-Time Offer",
      sale: "5% Discount",
      offerEnd: new Date(Date.now() + 1000 * 60 * 60 * 12), // 12 hours
      imgSrc: "/properties/ikate-duplex.jpg",
      buttonLink: "/properties/ikate-luxury-duplex",
      buttonText: "View Property",
      location: "Ikate, Lekki - Lagos",
      price: "₦350,000,000",
    },
    {
      id: 2,
      title: "Beachfront Apartment in Oniru, Victoria Island",
      deal: "Hot Listing",
      sale: "Exclusive Viewing Deal",
      offerEnd: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      imgSrc: "/properties/oniru-apartment.jpg",
      buttonLink: "/properties/oniru-beachfront-apartment",
      buttonText: "View Property",
      location: "Oniru, Victoria Island - Lagos",
      price: "₦180,000,000",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [offerEnd, setOfferEnd] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Auto-rotate slides every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProperties.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Countdown logic
  useEffect(() => {
    const currentOfferEnd = featuredProperties[currentSlide].offerEnd;
    setOfferEnd(currentOfferEnd);
  }, [currentSlide]);

  useEffect(() => {
    if (!offerEnd) return;
    const updateTimer = () => {
      const now = Date.now();
      const distance = offerEnd.getTime() - now;
      if (distance <= 0) return;

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [offerEnd]);

  const property = featuredProperties[currentSlide];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl mt-6">
      <div className="flex transition-transform duration-700 ease-in-out">
        {/* === Slide === */}
        <div
          key={property.id}
          className="flex flex-col-reverse md:flex-row items-center justify-between
            min-w-full py-10 md:py-16 px-6 md:px-20
            bg-gradient-to-r from-[#f9fafb] to-[#f3f4f8] dark:from-gray-900 dark:to-gray-800
            gap-10 md:gap-16"
        >
          {/* === Text Section === */}
          <div className="flex flex-col md:w-1/2 text-center md:text-left">
            <span className="inline-block px-4 py-1 mb-3 text-xs font-medium bg-orange-100 text-orange-700 rounded-md w-fit mx-auto md:mx-0">
              {property.deal}
            </span>

            <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-2">
              {property.title}
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {property.location}
            </p>

            <p className="text-lg font-semibold text-orange-600 mb-4">
              {property.price} <span className="text-sm text-gray-500">({property.sale})</span>
            </p>

            {/* Countdown */}
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400 mb-3 font-medium tracking-wide">
                Offer ends in:
              </p>
              <div className="flex justify-center md:justify-start gap-3">
                {[
                  { label: "HRS", value: timeLeft.hours },
                  { label: "MIN", value: timeLeft.minutes },
                  { label: "SEC", value: timeLeft.seconds },
                ].map((unit, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="relative bg-gray-900 text-orange-400 rounded-md shadow-lg w-14 h-16 flex items-center justify-center font-mono text-2xl font-bold">
                      <span className="z-10">{String(unit.value).padStart(2, "0")}</span>
                    </div>
                    <span className="text-[10px] mt-1 text-gray-600 dark:text-gray-400 tracking-widest font-medium">
                      {unit.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* View Property Button */}
              <Link href={property.buttonLink}>
                <button className="mt-8 px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-full shadow-md transition-all duration-300 flex items-center justify-center gap-2">
                  <span>{property.buttonText}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              </Link>
            </div>
          </div>

          {/* === Image Section === */}
          <div className="flex justify-center md:w-1/2">
            <Image
              className="w-[280px] sm:w-[360px] md:w-[480px] lg:w-[560px] h-auto object-cover rounded-2xl shadow-2xl"
              src={property.imgSrc}
              alt={property.title}
              width={560}
              height={560}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;
