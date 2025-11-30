"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useAppContext } from "@/context/AppContext";
import { Search, X, History, MapPin, ChevronDown, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import * as Select from "@radix-ui/react-select";

export default function Searchbar() {
  const router = useRouter();
  const inputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const { properties } = useAppContext();

  // Filters
  const [filterLocation, setFilterLocation] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const propertyTypes = ["Rent", "Sale", "Shortlet"];
  const propertyCategories = [
    "Apartment/Flat", "Duplexes", "Detached Houses", "Semi-Detached Houses",
    "Bungalows", "Mansions", "Penthouses", "Condominiums", "Studio Apartments",
    "Office Spaces", "Warehouses", "Hotels/Motels", "Event Centers/Halls",
    "Land", "Luxury Apartments", "Smart Homes"
  ];
  const locations = [...new Set(properties.map((p) => p.state))];

  // Load recent searches
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("recentPropertySearches");
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);



  // Filtered suggestions
  const filteredSuggestions = properties.filter((p) => {
    const q = inputValue.toLowerCase();
    return (
      (p.title ?? "").toLowerCase().includes(q) ||
      (p.address ?? "").toLowerCase().includes(q) ||
      (p.city ?? "").toLowerCase().includes(q) ||
      (p.state ?? "").toLowerCase().includes(q)
    ) &&
      (!filterLocation || p.state === filterLocation) &&
      (!filterType || p.type === filterType) &&
      (!filterCategory || p.category === filterCategory);
  });

  const handleSearch = (value) => {
    const search = (value ?? inputValue).trim();
    if (!search) return;

    const updated = [search, ...recentSearches.filter((s) => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentPropertySearches", JSON.stringify(updated));

    const matchedProperty = properties.find(
      (p) => p.title?.toLowerCase() === search.toLowerCase()
    );

    setIsOpen(false);

    if (matchedProperty) {
      // ✅ Go directly to the property page
      router.push(`/properties/${matchedProperty._id}`);
    } else {
      // ✅ Go to a "results" page that shows all similar matches
      router.push(`/properties?query=${encodeURIComponent(search)}`);
    }
  };


  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentPropertySearches");
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0 && filteredSuggestions[highlightIndex]) {
        const property = filteredSuggestions[highlightIndex];
        router.push(`/property/${property._id}`);
        setIsOpen(false);
      } else {
        handleSearch();
      }
    }
  };

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Search className="w-5 h-5 text-black dark:text-white" />
      </button>

      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-2xl flex flex-col"
              >
                {/* Header */}
                <div className="flex flex-col gap-3 p-4 bg-zinc-900/60 backdrop-blur-lg border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center flex-1 bg-zinc-800/70 rounded-full px-4 py-2">
                      <Search className="text-gray-50 w-5 h-5 mr-2" />
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search properties..."
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value);
                          setHighlightIndex(-1);
                        }}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
                      />
                      {inputValue && (
                        <button onClick={() => setInputValue("")}>
                          <X className="w-4 h-4 text-gray-300 hover:text-white" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-300 text-sm hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Filters */}
                  <div
                    key={`${filterLocation}-${filterType}-${filterCategory}`}
                    className="flex gap-2 items-center flex-wrap"
                  >
                    <SelectFilter
                      label="Location"
                      value={filterLocation}
                      onChange={setFilterLocation}
                      options={locations}
                    />
                    <SelectFilter
                      label="Type"
                      value={filterType}
                      onChange={setFilterType}
                      options={propertyTypes}
                    />
                    <SelectFilter
                      label="Category"
                      value={filterCategory}
                      onChange={setFilterCategory}
                      options={propertyCategories}
                    />

                    {(filterLocation || filterType || filterCategory) && (
                      <button
                        onClick={() => {
                          setFilterLocation("");
                          setFilterType("");
                          setFilterCategory("");
                        }}
                        className="ml-2 px-3 py-1 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-all"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Suggestions / Recent */}
                <div className="flex-1 overflow-y-auto p-5 text-white">
                  {inputValue ? (
                    filteredSuggestions.length > 0 ? (
                      <ul className="space-y-3">
                        {filteredSuggestions.slice(0, 8).map((p, i) => (
                          <li
                            key={p._id}
                            onClick={() => {
                              router.push(`/property/${p._id}`);
                              setIsOpen(false);
                            }}
                            className={`flex gap-4 p-3 rounded-xl cursor-pointer border border-transparent transition hover:border-orange-500/40 ${
                              highlightIndex === i
                                ? "bg-zinc-800/80"
                                : "hover:bg-zinc-800/50"
                            }`}
                          >
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={p.images?.[0] || "/placeholder.jpg"}
                                alt={p.title}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <h3 className="text-white font-medium truncate">
                                  {p.title}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                  {p.type} • {p.category}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  {p.bedrooms} bd • {p.bathrooms} ba •{" "}
                                  {p.toilets} toilets
                                </p>
                                <p className="text-gray-400 text-sm flex items-center gap-1">
                                  <MapPin size={14} /> {p.address}, {p.city},{" "}
                                  {p.state}
                                </p>
                              </div>
                              {p.price && (
                                <p className="text-orange-400 text-sm font-semibold mt-2">
                                  ${p.price.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <X size={14} /> No matching properties found
                      </p>
                    )
                  ) : (
                    recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                            <History size={14} /> Recent Searches
                          </h4>
                          <button
                            onClick={handleClearRecent}
                            className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Clear all
                          </button>
                        </div>

                        <ul className="space-y-2">
                          {recentSearches.map((s) => (
                            <li
                              key={s}
                              onClick={() => handleSearch(s)}
                              className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-zinc-800/70"
                            >
                              <span className="text-sm text-gray-200">
                                {s}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

/* ----------------- SelectFilter ----------------- */
function SelectFilter({ label, value, onChange, options }) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className="flex items-center justify-between w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700">
        <span>{value || `Select ${label}`}</span>
        <Select.Icon>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Content className="bg-white border border-gray-300 rounded-lg shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
        <Select.Viewport className="p-2">
          {options.map((opt) => (
            <Select.Item
              key={opt}
              value={opt}
              className="text-sm px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
            >
              {opt}
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  );
}
