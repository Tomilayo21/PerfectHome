"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const AboutSection = ({ aboutGrouped }) => {
  // Check if there's data
  if (!aboutGrouped || aboutGrouped.length === 0) return null;

  // Find the first non-empty section
  const firstSection = aboutGrouped.find(([section, items]) => items && items.length > 0);
  if (!firstSection) return null;

  const firstEntry = firstSection[1][0];
  if (!firstEntry) return null;

  // Function to truncate text
  const truncateText = (html, maxChars = 500) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars) + "...";
  };

  return (
    <div className="py-16 bg-white dark:bg-white">
      <div className="max-w-6xl mx-auto px-6 md:flex md:items-center md:space-x-12">
        {/* Text */}
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-900 mb-4">
            About Us
          </h2>

          <p className="text-gray-500 dark:gray-500 leading-relaxed text-justify">
            {truncateText(firstEntry.description || "")}
          </p>
          <Link href="/about" passHref>
            <button className="mt-4 px-6 py-3 bg-gray-900 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors duration-300">
              Read More
            </button>
          </Link>
        </div>

        {/* Image */}
        {firstEntry.image?.length > 0 && (
          <div className="md:w-1/2 mt-6 md:mt-0 flex justify-center">
            <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={firstEntry.image[0]}
                alt={firstEntry.heading || "About Us"}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutSection;
