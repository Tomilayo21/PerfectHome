"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { Search, X, MapPin } from "lucide-react";
import Image from "next/image";

const HeroSection = () => {
  const router = useRouter();
  const { properties } = useAppContext();
  const inputRef = useRef(null);

  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  // Load recent searches
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("recentPropertySearches");
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  // Save recent searches
  const saveRecentSearch = (search) => {
    const updated = [search, ...recentSearches.filter((s) => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentPropertySearches", JSON.stringify(updated));
  };

  // Filter suggestions
  useEffect(() => {
    const q = inputValue.toLowerCase();
    if (!q) {
      setSuggestions([]);
      return;
    }

    const filtered = properties.filter(
      (p) =>
        (p.title ?? "").toLowerCase().includes(q) ||
        (p.address ?? "").toLowerCase().includes(q) ||
        (p.city ?? "").toLowerCase().includes(q) ||
        (p.state ?? "").toLowerCase().includes(q)
    );
    setSuggestions(filtered.slice(0, 6));
  }, [inputValue, properties]);

  // Handle search
  const handleSearch = (searchText) => {
    const search = (searchText ?? inputValue).trim();
    if (!search) return;

    saveRecentSearch(search);

    const matchedProperty = properties.find(
      (p) => p.title?.toLowerCase() === search.toLowerCase()
    );

    if (matchedProperty) {
      router.push(`/properties/${matchedProperty._id}`);
    } else {
      router.push(`/properties?query=${encodeURIComponent(search)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0 && suggestions[highlightIndex]) {
        const property = suggestions[highlightIndex];
        router.push(`/properties/${property._id}`);
      } else {
        handleSearch();
      }
    }
  };

  return (
    <section className="relative w-full h-[120vh] flex flex-col items-center justify-center overflow-hidden text-white">
      {/* === Background Video === */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/VID-20251105-WA0027.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* === Overlay === */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10"></div>

      {/* === Content === */}
      <div className="relative z-20 text-center px-6 md:px-12 max-w-4xl">
        <p className="uppercase tracking-widest text-sm md:text-base text-blue-200 font-medium mb-3">
          Find Your <span className="text-blue-400">Dream Home</span> Today
        </p>

        {/* === Search Bar === */}
        <div className="relative flex flex-col items-center w-full max-w-3xl mx-auto">
          <div
            className="
              flex flex-col sm:flex-row items-center justify-center
              gap-2 sm:gap-4
              p-4 sm:p-3
              w-full
              bg-white/10 backdrop-blur-md rounded-xl
              shadow-lg
            "
          >
            <div className="relative flex items-center w-full">
              <Search className="absolute left-4 text-gray-400 w-5 h-5" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search properties by name, city, or state..."
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setHighlightIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="
                  w-full pl-12 pr-10 py-3.5
                  text-gray-900
                  bg-white/90
                  rounded-md
                  placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  transition-all duration-200
                "
              />
              {inputValue && (
                <button
                  onClick={() => setInputValue("")}
                  className="absolute right-4 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => handleSearch()}
              className="
                px-8 sm:px-10 py-3.5
                bg-blue-500 hover:bg-blue-600
                text-white font-medium uppercase tracking-wide
                rounded-md
                shadow-md hover:shadow-lg
                transition-all duration-200
                w-full sm:w-auto
              "
            >
              Search
            </button>
          </div>

          {/* === Suggestions Dropdown === */}
          {inputValue && suggestions.length > 0 && (
            <ul className="absolute top-full mt-2 w-full bg-white/95 rounded-lg shadow-lg text-gray-900 overflow-hidden max-h-64 overflow-y-auto">
              {suggestions.map((p, i) => (
                <li
                  key={p._id}
                  onClick={() => router.push(`/properties/${p._id}`)}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 ${
                    highlightIndex === i ? "bg-gray-100" : ""
                  }`}
                >
                  <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={p.images?.[0] || "/placeholder.jpg"}
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <p className="font-medium text-gray-800">{p.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={12} /> {p.city}, {p.state}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
