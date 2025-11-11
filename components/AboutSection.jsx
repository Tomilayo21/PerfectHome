"use client";

import React from "react";
import Image from "next/image";

const AboutSection = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-800">
        <section className="py-16 bg-gray-100 px-6">
            <div className="container mx-auto text-center md:text-left md:flex md:items-center md:space-x-12">
                <div className="md:w-1/2">
                    <h3 className="text-2xl font-semibold mb-4">About Our Company</h3>
                    <p className="text-gray-700 leading-relaxed">
                        PerfectHome properties is a trusted property development and brokerage firm
                        offering premium sales, rentals, and management services across
                        Nigeria. We combine technology with expertise to simplify your real estate journey.
                    </p>
                    <p className="text-gray-600 text-md leading-relaxed mb-6">
                        From luxury apartments to smart homes and prime locations, our team
                        is dedicated to helping you find the perfect property. Trust, quality,
                        and innovation are at the core of everything we do.
                    </p>
                    <button className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700">
                        Learn More
                    </button>
                </div>
                {/* ===== Image / Video Section ===== */}
                <div className="md:w-1/2 flex justify-center">
                    <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden shadow-xl">
                        <Image
                        src="/real_estate_office.jpg" // Replace with your company image
                        alt="About RealEstateCo"
                        fill
                        className="object-cover"
                        priority
                        />
                        {/* Optional overlay for text or effect */}
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    </div>
                </div>
            </div>
        </section>
    </div>
  );
};

export default AboutSection;
