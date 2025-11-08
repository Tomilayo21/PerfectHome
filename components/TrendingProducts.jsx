"use client";
import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";
import FadeInWhenVisible from "./animations/FadeInWhenVisible";

const TrendingProducts = () => {
  const { products, router } = useAppContext();

  // Pick top 5 trending products (or first 5 as placeholder)
  const trendingProducts = products.slice(0, 5);

  return (
    <div className="flex flex-col items-center pt-16 lg:px-32 px-6">
      {/* === Section Header === */}
      <div className="flex flex-col items-center text-center mb-10">
        <p className="text-3xl md:text-4xl font-normal text-gray-900 dark:text-white">
          Trending Products
        </p>
        <p className="mt-3 max-w-2xl text-gray-600 font-light dark:text-gray-400 text-sm md:text-base">
          Discover what’s hot right now — our top bestsellers loved by customers.
        </p>
      </div>

      {/* === Product Grid === */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full">
        {trendingProducts.map((product, index) => (
          <FadeInWhenVisible key={index} delay={index * 0.1}>
            <ProductCard product={product} />
          </FadeInWhenVisible>
        ))}
      </div>

      {/* === See More Button === */}
      <div className="mt-10">
        <button
          onClick={() => router.push("/all-products")}
          className="px-10 py-2.5 border rounded-full text-gray-600 dark:text-gray-300 
                     border-gray-300 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 
                     transition font-medium text-sm"
        >
          See More
        </button>
      </div>
    </div>
  );
};

export default TrendingProducts;
