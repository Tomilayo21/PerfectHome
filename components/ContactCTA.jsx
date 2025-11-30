"use client";

import React from "react";
import Link from "next/link";

const ContactCTA = () => {
  return (
    <section className="py-20 px-6 bg-white text-gray">
      <div className="max-w-4xl mx-auto text-center">
        <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-snug">
          Ready to Find Your Dream Property?
        </h3>
        <p className="mb-8 text-lg sm:text-xl text-gray-900">
          Connect with our expert agents today and let us help you find the perfect home.
        </p>
        <Link href="/contact">
          <button className="px-8 sm:px-12 py-4 sm:py-5 bg-gray-900 hover:bg-blue-500 text-white font-semibold rounded-md shadow-lg hover:shadow-xl hover:bg-gray-800  transition-all duration-300">
            Contact Us
          </button>
        </Link>
      </div>
    </section>
  );
};

export default ContactCTA;
