"use client";

import { Suspense, useMemo } from "react";
import {
  useSearchParams,
  usePathname,
  useRouter,
} from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilterBar from "@/components/PropertyFilterBar";
import ProductSlider from "@/components/ProductSlider";
import { useAppContext } from "@/context/AppContext";
import {
  Frown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PROPERTIES_PER_PAGE = 25;

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading properties...</div>}>
      <SearchResults />
    </Suspense>
  );
}

const SearchResults = () => {
  const {
    properties,
    loading,
    secondaryColor,
    fontSize,
    layoutStyle: effectiveLayout,
  } = useAppContext();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // === Extract filters and query ===
  const query =
    searchParams.get("query") ||
    searchParams.get("search") ||
    "";
  const type = searchParams.get("type") || "";
  const category = searchParams.get("category") || "";
  const state = searchParams.get("state") || "";
  const bedrooms = parseInt(searchParams.get("bedrooms")) || 0;
  const bathrooms = parseInt(searchParams.get("bathrooms")) || 0;
  const toilets = parseInt(searchParams.get("toilets")) || 0;
  const area = parseInt(searchParams.get("area")) || 0;
  const feature = searchParams.get("feature") || "";
  const min = parseFloat(searchParams.get("min")) || 0;
  const max = parseFloat(searchParams.get("max")) || Infinity;
  const sort = searchParams.get("sort") || "";
  const pageRaw = searchParams.get("page");

  const currentPage =
    pageRaw && !isNaN(parseInt(pageRaw)) && parseInt(pageRaw) > 0
      ? parseInt(pageRaw)
      : 1;

  // === Filter + Search logic ===
  const filteredProperties = useMemo(() => {
    let filtered = [...properties];
    const q = query.toLowerCase();

    if (type) filtered = filtered.filter((p) => p.type === type);
    if (category)
      filtered = filtered.filter((p) => p.category === category);
    if (state) filtered = filtered.filter((p) => p.state === state);
    if (bedrooms)
      filtered = filtered.filter((p) => p.bedrooms >= bedrooms);
    if (bathrooms)
      filtered = filtered.filter((p) => p.bathrooms >= bathrooms);
    if (toilets)
      filtered = filtered.filter((p) => p.toilets >= toilets);
    if (area)
      filtered = filtered.filter((p) => parseFloat(p.area) >= area);
    if (feature)
      filtered = filtered.filter((p) => p.features?.includes(feature));

    // === Search query filtering ===
    if (query) {
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.state?.toLowerCase().includes(q)
      );
    }

    // === Price range ===
    filtered = filtered.filter((p) => p.price >= min && p.price <= max);

    // === Sorting ===
    if (sort === "asc price") filtered.sort((a, b) => a.price - b.price);
    if (sort === "desc price") filtered.sort((a, b) => b.price - a.price);
    if (sort === "asc date")
      filtered.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    if (sort === "desc date")
      filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

    return filtered;
  }, [
    properties,
    type,
    category,
    state,
    bedrooms,
    bathrooms,
    toilets,
    area,
    feature,
    query,
    min,
    max,
    sort,
  ]);

  // === Pagination ===
  const totalPages = Math.ceil(
    filteredProperties.length / PROPERTIES_PER_PAGE
  );
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * PROPERTIES_PER_PAGE,
    currentPage * PROPERTIES_PER_PAGE
  );

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // === Styles ===
  const fontSizeClass =
    fontSize === "small"
      ? "font-size-small"
      : fontSize === "large"
      ? "font-size-large"
      : "font-size-medium";

  const propertyLayoutClass =
    effectiveLayout === "list"
      ? "flex flex-col gap-6"
      : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6";

  // === Loading State ===
  if (loading) {
    return (
      <>
        <Navbar />
        <ProductSlider />
        <div className="w-full flex justify-center items-center h-96 text-lg text-gray-600">
          Loading properties...
        </div>
        <Footer />
      </>
    );
  }

  // === MAIN RENDER ===
  return (
    <>
      <Navbar />
      <ProductSlider />

      <div className="flex flex-col items-start px-6 md:px-16 mt-10 lg:px-32 pt-8">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b pb-6">
          <h2
            className={`font-semibold text-2xl md:text-3xl ${fontSizeClass}`}
            style={{ color: secondaryColor }}
          >
            {query
              ? `Search results for “${query}”`
              : "All Properties"}
          </h2>
        </div>

        {/* Filters (only visible when not searching) */}
        {!query && (
          <div className="mt-6 w-full bg-white shadow-sm border rounded-xl p-4">
            <PropertyFilterBar />
          </div>
        )}

        {/* Results / Empty State */}
        {paginatedProperties.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center mt-20 mb-20 text-gray-600 text-center">
            <Frown className="w-14 h-14 text-gray-400 mb-4" />
            <p className="text-lg font-semibold">
              {query
                ? `No properties found matching “${query}”.`
                : type
                ? `No ${type.toLowerCase()} properties found.`
                : category
                ? `No properties found under “${category}”.`
                : "No properties available right now."}
            </p>
            <p className="text-sm text-gray-500 mt-2 max-w-md">
              {query || type || category
                ? "Try adjusting filters or clear your search."
                : "New properties are added regularly — please check back later."}
            </p>

            {/* Reset Button */}
            {(query || type || category) && (
              <button
                onClick={() => router.push(pathname)}
                className="mt-6 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className={`${propertyLayoutClass} mt-12 pb-14 w-full`}>
            {paginatedProperties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="w-full flex justify-center mt-12 mb-16">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white shadow border max-w-fit">
              {/* Prev */}
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-1 rounded border text-sm font-medium transition ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-orange-100"
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              {/* Page numbers */}
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                const isVisible =
                  totalPages <= 7 ||
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 &&
                    pageNum <= currentPage + 1);

                if (!isVisible) {
                  if (
                    (pageNum === 2 && currentPage > 4) ||
                    (pageNum === totalPages - 1 &&
                      currentPage < totalPages - 3)
                  ) {
                    return (
                      <span
                        key={pageNum}
                        className="px-2 text-gray-400 select-none"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => changePage(pageNum)}
                    className={`px-3 py-1 rounded border text-sm font-medium transition ${
                      pageNum === currentPage
                        ? "bg-orange-600 text-white"
                        : "bg-white text-gray-800 hover:bg-orange-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next */}
              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-3 py-1 rounded border text-sm font-medium transition ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-orange-100"
                }`}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};
