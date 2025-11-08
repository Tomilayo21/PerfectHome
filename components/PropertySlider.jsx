"use client";
import React, { useEffect, useState } from "react";
import PropertyCard from "@/components/PropertyCard";

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

  return (
    <div className="min-h-screen px-6 py-10">
      <h2 className="text-3xl font-semibold text-center mb-8 text-gray-900 dark:text-white">
        Featured Properties
      </h2>

      {properties.length === 0 ? (
        <p>No properties found</p>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <PropertyCard key={p._id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
