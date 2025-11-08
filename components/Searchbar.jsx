// "use client";

// import { useEffect, useRef, useState } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { assets } from "@/assets/assets"; 
// import { useAppContext } from "@/context/AppContext"; 
// import { Search, Clock, X, History } from "lucide-react"; // clean SVG icons
// import { motion, AnimatePresence } from "framer-motion";

// export default function SearchBar() {
//   const router = useRouter();
//   const searchRef = useRef(null);
//   const containerRef = useRef(null);

//   const [inputValue, setInputValue] = useState("");
//   const [searchExpanded, setSearchExpanded] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [recentSearches, setRecentSearches] = useState([]);
//   const [highlightIndex, setHighlightIndex] = useState(-1);
//   const inputRef = useRef(null)

//   const { products } = useAppContext();
//   const productNames = products?.map((p) => p.name) || [];

//   const filteredSuggestions = productNames.filter(
//     (item) =>
//       item.toLowerCase().includes(inputValue.toLowerCase()) &&
//       item.toLowerCase() !== inputValue.toLowerCase()
//   );

//   useEffect(() => {
//     const stored = localStorage.getItem("recentSearches");
//     if (stored) setRecentSearches(JSON.parse(stored));
//   }, []);

//   const handleSearch = (customValue) => {
//     const search = (customValue ?? inputValue).trim();
//     if (search) {
//       const updatedRecent = [
//         search,
//         ...recentSearches.filter((s) => s !== search),
//       ].slice(0, 5);
//       setRecentSearches(updatedRecent);
//       localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));

//       router.push(`/all-products?search=${encodeURIComponent(search)}`);
//       setSearchExpanded(false);
//       setShowDropdown(false);
//     } else {
//       setSearchExpanded(true);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setHighlightIndex((prev) =>
//         prev < filteredSuggestions.length - 1 ? prev + 1 : 0
//       );
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setHighlightIndex((prev) =>
//         prev > 0 ? prev - 1 : filteredSuggestions.length - 1
//       );
//     } else if (e.key === "Enter") {
//       if (highlightIndex >= 0 && filteredSuggestions[highlightIndex]) {
//         handleSearch(filteredSuggestions[highlightIndex]);
//       } else {
//         handleSearch();
//       }
//     }
//   };

//   const handleClickOutside = (e) => {
//     if (containerRef.current && !containerRef.current.contains(e.target)) {
//       setShowDropdown(false);
//       setSearchExpanded(false);
//     }
//   };

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleDeleteRecent = (item) => {
//     const updated = recentSearches.filter((s) => s !== item);
//     setRecentSearches(updated);
//     localStorage.setItem("recentSearches", JSON.stringify(updated));
//   };

//   const clearAll = () => {
//     setRecentSearches([]);
//     localStorage.removeItem("recentSearches");
//   };

//   return (
//     <div className="relative flex items-center w-full max-w-lg" ref={containerRef}>
//       <div className="relative w-full">
//         {/* Input */}
//         <input
//           ref={searchRef}
//           type="text"
//           placeholder="Search products, brands, categories..."
//           value={inputValue}
//           onChange={(e) => {
//             setInputValue(e.target.value);
//             setHighlightIndex(-1);
//           }}
//           onFocus={() => {
//             setSearchExpanded(true);
//             setShowDropdown(true);
//           }}
//           onBlur={() => {
//             setTimeout(() => setShowDropdown(false), 200);
//           }}
//           onKeyDown={handleKeyDown}
//           className={`transition-all duration-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-full py-2 pr-10 pl-4 text-sm text-gray-700 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400 ${
//             searchExpanded ? "opacity-100 w-full" : "opacity-0 w-0 pl-0 pr-0"
//           }`}
//         />

//         {/* Search Icon Button */}
//         <button
//           onClick={() => handleSearch()}
//           className="absolute top-1/2 right-2 hover:scale-110 transform -translate-y-1/2 text-gray-500 hover:text-orange-600 transition"
//           aria-label="Search"
//         >
//           <Search size={18} />
//         </button>
//       </div>

//       {/* Dropdown */}
//       {/* <AnimatePresence>
//         {showDropdown && (
//           <motion.div
//             key="search-dropdown"
//             initial={{ opacity: 0, y: -10, height: 0 }}
//             animate={{ opacity: 1, y: 0, height: "auto" }}
//             exit={{ opacity: 0, y: -10, height: 0 }}
//             transition={{ duration: 0.25, ease: "easeInOut" }}
//             className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 overflow-hidden"
//           >
//             {inputValue && filteredSuggestions.length > 0 ? (
//               <ul>
//                 {filteredSuggestions.map((s, i) => (
//                   <li
//                     key={i}
//                     onClick={() => handleSearch(s)}
//                     className={`px-4 py-2 cursor-pointer text-sm flex items-center gap-2 transition ${
//                       highlightIndex === i
//                         ? "bg-orange-100 dark:bg-gray-800 font-medium"
//                         : "hover:bg-gray-100 dark:hover:bg-gray-800"
//                     }`}
//                   >
//                     <Search size={14} className="text-gray-400" />
//                     {s}
//                   </li>
//                 ))}
//               </ul>
//             ) : inputValue ? (
//               <div className="px-4 py-3 text-xs text-gray-400 flex items-center gap-2">
//                 <X size={14} className="text-gray-400" />
//                 No suggestions
//               </div>
//             ) : null}


//             {!inputValue && recentSearches.length > 0 && (
//               <div>
//                 <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
//                   <span className="font-medium">Recent Searches</span>
//                   <button
//                     onClick={clearAll}
//                     className="text-red-500 text-xs hover:underline"
//                   >
//                     Clear All
//                   </button>
//                 </div>
//                 <ul>
//                   {recentSearches.map((s, i) => (
//                     <li
//                       key={i}
//                       className="px-4 py-2 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm transition"
//                     >
//                       <span
//                         onClick={() => handleSearch(s)}
//                         className="flex items-center gap-2 flex-1"
//                       >
//                         <History size={14} className="text-gray-400" />
//                         {s}
//                       </span>
//                       <button
//                         onClick={() => handleDeleteRecent(s)}
//                         className="text-red-500 text-xs ml-2 hover:scale-110 transition-transform"
//                       >
//                         <X size={14} />
//                       </button>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence> */}

//       <AnimatePresence>
//         {showDropdown && (
//           <motion.div
//             key="search-fullscreen"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.25, ease: "easeInOut" }}
//             className="
//               fixed inset-0 z-[9999] 
//               bg-black/60 backdrop-blur-2xl 
//               flex flex-col
//             "
//           >
//             {/* Header */}
//             <div className="flex items-center gap-3 p-4 bg-zinc-900/70 backdrop-blur-lg border-b border-zinc-800">
//               <div className="flex items-center flex-1 bg-zinc-800/60 rounded-full px-4 py-2">
//                 <Search className="text-gray-400 w-5 h-5 mr-2" />
//                 <input
//                   ref={inputRef}
//                   type="text"
//                   placeholder="Search..."
//                   value={inputValue}
//                   onChange={(e) => {
//                     setInputValue(e.target.value);
//                     setHighlightIndex(-1);
//                   }}
//                   className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
//                 />
//               </div>
//               <button
//                 onClick={() => setShowDropdown(false)}
//                 className="p-2 rounded-full hover:bg-zinc-800"
//               >
//                 <X className="text-white w-6 h-6" />
//               </button>
//             </div>

//             {/* Content */}
//             <div className="flex-1 p-5 text-white overflow-y-auto">
//               {inputValue && filteredSuggestions.length > 0 && (
//                 <div className="mb-6">
//                   <h2 className="font-semibold text-lg mb-2">Suggestions</h2>
//                   <ul className="space-y-2">
//                     {filteredSuggestions.map((s, i) => (
//                       <li
//                         key={i}
//                         onClick={() => handleSearch(s)}
//                         className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${
//                           highlightIndex === i
//                             ? "bg-zinc-800"
//                             : "hover:bg-zinc-800/60"
//                         }`}
//                       >
//                         <Search size={14} className="text-gray-400" />
//                         {s}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {inputValue && filteredSuggestions.length === 0 && (
//                 <p className="text-gray-400 flex items-center gap-2">
//                   <X size={14} /> No suggestions
//                 </p>
//               )}

//               {/* Recent Searches */}
//               {!inputValue && recentSearches.length > 0 && (
//                 <div>
//                   <div className="flex justify-between items-center mb-2">
//                     <h2 className="font-semibold text-lg">Recent Searches</h2>
//                     <button
//                       onClick={clearAll}
//                       className="text-sm text-gray-400 hover:text-white"
//                     >
//                       Clear all
//                     </button>
//                   </div>
//                   <ul className="space-y-2">
//                     {recentSearches.map((s, i) => (
//                       <li
//                         key={i}
//                         className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-zinc-800/60 cursor-pointer"
//                       >
//                         <span
//                           onClick={() => handleSearch(s)}
//                           className="flex items-center gap-2"
//                         >
//                           <History size={14} className="text-gray-400" />
//                           {s}
//                         </span>
//                         <button
//                           onClick={() => handleDeleteRecent(s)}
//                           className="text-gray-500 hover:text-red-500"
//                         >
//                           <X size={14} />
//                         </button>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }









































"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useAppContext } from "@/context/AppContext";
import { Search, X, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Searchbar() {
  const router = useRouter();
  const inputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const { products } = useAppContext();
  const productNames = products?.map((p) => p.name) || [];

  const filteredSuggestions = productNames.filter(
    (item) =>
      item.toLowerCase().includes(inputValue.toLowerCase()) &&
      item.toLowerCase() !== inputValue.toLowerCase()
  );

  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  const handleSearch = (value) => {
    const search = (value ?? inputValue).trim();
    if (!search) return;

    const updated = [search, ...recentSearches.filter((s) => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));

    setIsOpen(false);
    router.push(`/all-products?search=${encodeURIComponent(search)}`);
  };

  const handleDeleteRecent = (item) => {
    const updated = recentSearches.filter((s) => s !== item);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearAll = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
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
        handleSearch(filteredSuggestions[highlightIndex]);
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



        {/* Overlay Portal (outside stacking issues) */}
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
                    className="
                        fixed inset-0 z-[9999]
                        bg-black/60
                        backdrop-blur-2xl
                        flex flex-col
                    "
                    >
                    {/* Header */}
                    <div className="flex items-center gap-3 p-4 bg-zinc-900/60 backdrop-blur-lg border-b border-zinc-800">
                        <div className="flex items-center flex-1 bg-zinc-800/70 rounded-full px-4 py-2">
                        <Search className="text-gray-50 w-5 h-5 font-thin mr-2" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search..."
                            value={inputValue}
                            onChange={(e) => {
                            setInputValue(e.target.value);
                            setHighlightIndex(-1);
                            }}
                            onKeyDown={handleKeyDown}
                            className="flex-1 font-thin bg-transparent outline-none text-white placeholder-gray-400"
                        />
                        </div>
                        <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-300 text-sm ml-3 font-thin hover:text-white"
                        >
                        Cancel
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-5 text-white">
                        {!inputValue && recentSearches.length > 0 && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-thin">Recent Searches</h2>
                            <button
                                onClick={clearAll}
                                className="text-sm text-gray-200 font-thin hover:text-white"
                            >
                                Clear all
                            </button>
                            </div>
                            <ul className="space-y-2">
                            {recentSearches.map((s, i) => (
                                <li
                                key={i}
                                className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-zinc-800/60 cursor-pointer"
                                >
                                <span
                                    onClick={() => handleSearch(s)}
                                    className="flex items-center gap-2 font-thin"
                                >
                                    <History size={14} className="text-gray-50 font-thin" />
                                    {s}
                                </span>
                                <button
                                    onClick={() => handleDeleteRecent(s)}
                                    className="text-gray-200 hover:text-red-500"
                                >
                                    <X size={14} />
                                </button>
                                </li>
                            ))}
                            </ul>
                        </div>
                        )}

                        {inputValue && (
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Suggestions</h2>
                            {filteredSuggestions.length > 0 ? (
                            <ul className="space-y-2">
                                {filteredSuggestions.map((s, i) => (
                                <li
                                    key={i}
                                    onClick={() => handleSearch(s)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${
                                    highlightIndex === i
                                        ? "bg-zinc-800"
                                        : "hover:bg-zinc-800/60"
                                    }`}
                                >
                                    <Search size={14} className="text-gray-400" />
                                    {s}
                                </li>
                                ))}
                            </ul>
                            ) : (
                            <p className="text-sm text-gray-400 flex items-center gap-2">
                                <X size={14} /> No results found
                            </p>
                            )}
                        </div>
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
