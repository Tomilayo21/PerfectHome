"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsAndConditionsPage() {
  const router = useRouter();
  const [terms, setTerms] = useState([]);

  useEffect(() => {
    fetch("/api/terms")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched terms:", data);
        setTerms(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to fetch terms:", err);
        setTerms([]);
      });
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-50 mt-16 min-h-screen">
      <Navbar />

      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -50, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto px-6 py-12"
      >
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-900 mb-10">
          Terms & Conditions
        </h1>

        {/* Terms content */}
        <div className="space-y-8">
          {terms.length > 0 ? (
            terms.map((term, index) => (
              <div
                key={term._id}
                className="bg-white dark:bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-900">
                  {index + 1}. {term.title}
                </h2>
                <p className="whitespace-pre-line text-gray-700 dark:text-gray-700 leading-relaxed">
                  {term.content}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No terms available.</p>
          )}
        </div>
      </motion.div>

      <Footer />
    </div>
  );
}
