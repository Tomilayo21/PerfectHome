"use client";
import React, { useEffect, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import Link from "next/link";

export default function PropertySlider() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch("/api/property/list");
        const data = await res.json();
        setProperties(data);
      } catch (err) {
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading properties...</p>;

  // Limit to first 15
  const displayedProperties = properties.slice(0, 15);

  return (
    <div className="min-h-screen px-6 py-10 bg-white">
      <h2 className="text-3xl font-semibold text-center mb-8 text-black">
        Featured Properties
      </h2>

      {displayedProperties.length === 0 ? (
        <p className="bg-white">No properties found</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProperties.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>

          {/* Show See More only if more than 15 */}
          {properties.length > 15 && (
            <div className="flex justify-center mt-10">
              <Link href="/properties">
                <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition">
                  See More Properties →
                </button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
