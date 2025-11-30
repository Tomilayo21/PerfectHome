"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ✅ Make sure these components exist
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function FAQPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    fetch("/api/faq")
      .then((res) => res.json())
      .then((data) => setFaqs(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch FAQs:", err));
  }, []);

  useEffect(() => {
    const navbar = document.getElementById("main-navbar");
    if (navbar) {
      const updateHeight = () => {
        const height = navbar.offsetHeight;
        document.documentElement.style.setProperty("--navbar-height", height + "px");
      };

      updateHeight();
      window.addEventListener("resize", updateHeight);

      return () => window.removeEventListener("resize", updateHeight);
    }
  }, []);

  return (
    <>
      <Navbar />

      <div className="bg-gray-50 dark:bg-gray-50 pt-[calc(var(--navbar-height)+2rem)] min-h-screen pb-16">

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto px-6"
        >


          {/* Page Title */}
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-900 mb-10">
            Frequently Asked Questions
          </h1>

          {/* FAQ Content */}
          <div className="space-y-6">
            {faqs.length > 0 ? (
              faqs.map((faq, index) => (
                <div
                  key={faq._id}
                  className="bg-gray-50 dark:bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-900">
                    {index + 1}. {faq.question}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No FAQs available at the moment.</p>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />

    </>
  );
}
