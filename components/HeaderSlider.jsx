

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const HeaderSlider = () => {
  const sliderData = [
    {
      id: 1,
      title: "Find Your Dream Home with Us",
      offer: "Luxury Apartments • Smart Homes • Prime Locations",
      buttonText1: "Explore Properties",
      buttonText2: "Contact an Agent",
      imgSrc: "/real_estate_hero1.jpg",
    },
    {
      id: 2,
      title: "Invest in the Future of Real Estate",
      offer: "High ROI • Modern Designs • Strategic Developments",
      buttonText1: "View Investment Options",
      buttonText2: "Learn More",
      imgSrc: "/real_estate_hero2.jpg",
    },
    {
      id: 3,
      title: "Building Communities That Inspire Living",
      offer: "Residential • Commercial • Estate Development",
      buttonText1: "See Our Projects",
      buttonText2: "Get Started",
      imgSrc: "/real_estate_hero3.jpg",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderData.length]);

  const handleSlideChange = (index) => setCurrentSlide(index);

  return (
    <div className="relative w-full overflow-hidden">
      {/* === Slider Wrapper === */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            className="
              flex flex-col-reverse md:flex-row items-center justify-between
              min-w-full py-10 md:py-16 px-6 md:px-20
              bg-gradient-to-r from-[#FDFCFB] to-[#F3F4F8] dark:from-gray-900 dark:to-gray-800
              gap-10 md:gap-16
            "
          >
            {/* === Text Section === */}
            <div className="flex flex-col md:w-1/2 text-center md:text-left">
              <p className="uppercase tracking-widest text-xs md:text-sm text-blue-500 font-medium mb-3">
                {slide.offer}
              </p>

              <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold leading-snug text-gray-900 dark:text-white mb-6">
                {slide.title}
              </h1>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                <Link href="/properties">
                  <button className="px-6 md:px-8 py-3 bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium rounded-full shadow-md transition">
                    {slide.buttonText1}
                  </button>
                </Link>

                <Link href="/contact">
                  <button className="group flex items-center justify-center sm:justify-start gap-2 px-6 py-3 text-gray-800 dark:text-white text-sm font-medium hover:text-blue-700 transition">
                    {slide.buttonText2}
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* === Image Section === */}
            <div className="flex justify-center md:w-1/2">
              <Image
                className="w-[280px] sm:w-[360px] md:w-[480px] lg:w-[520px] h-auto object-cover rounded-2xl shadow-xl"
                src={slide.imgSrc}
                alt={`Slide ${index + 1}`}
                width={560}
                height={560}
                priority
              />
            </div>
          </div>
        ))}
      </div>

      {/* === Navigation Dots === */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {sliderData.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? "bg-green-700" : "bg-gray-400"
            } transition`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
