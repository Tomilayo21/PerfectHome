"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // ✅ Use this instead of from context
import { assets } from "@/assets/assets";
import FadeInWhenVisible from "./animations/FadeInWhenVisible";

const Categories = () => {
  const router = useRouter(); // ✅ Standard Next.js router

  const categories = [
    { name: "Headphones", image: "/headphones.jpg", slug: "Headphone" },
    { name: "Laptops", image: "/Gemini_Laptop.png", slug: "Laptop" },
    { name: "Consoles", image: "/Gemini_Console.png", slug: "Consoles" },
    { name: "Accessories", image: "/Gemini_Accessories.png", slug: "Accessories" },
    { name: "Smartphones", image: "/Gemini_Phone.png", slug: "Smartphone" },
  ];

  return (
    <div className="flex flex-col items-center pt-16 lg:px-32 px-6">
      <div className="flex flex-col items-center text-center mb-10">
        <p className="text-3xl md:text-4xl font-normal text-gray-900 dark:text-white">
          Shop by Category
        </p>
        <p className="mt-3 max-w-2xl text-gray-600 font-light dark:text-gray-400 text-sm md:text-base">
          Browse our top categories and find products that fit your lifestyle.
        </p>
      </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full">
        {categories.map((category, index) => (
            <FadeInWhenVisible key={index} delay={index * 0.1}>
            <div
                onClick={() => router.push(`/all-products?category=${category.slug}`)}
                className="group relative w-full h-40 sm:h-48 md:h-56 
                        rounded-xl overflow-hidden cursor-pointer 
                        shadow-sm hover:shadow-md transition-transform duration-300"
            >
                {/* === Image === */}
                <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover 
                            group-hover:scale-110 transition-transform duration-500"
                />

                {/* === Overlay === */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>

                {/* === Category Name === */}
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center 
                            text-white font-normal text-sm md:text-base 
                            px-4 py-1.5 bg-orange-600/80 rounded-full 
                            opacity-90 group-hover:bg-orange-600 group-hover:opacity-100 
                            transition-all duration-300">
                {category.name}
                </p>
            </div>
            </FadeInWhenVisible>
        ))}
        </div>


      <div className="mt-10">
        <button
          onClick={() => router.push("/all-products")}
          className="px-10 py-2.5 border rounded-full text-gray-600 dark:text-gray-300 
                     border-gray-300 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 
                     transition font-medium text-sm"
        >
          See All Products
        </button>
      </div>
    </div>
  );
};

export default Categories;
