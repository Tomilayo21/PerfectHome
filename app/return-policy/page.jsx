

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ReturnPolicyPage() {
  const router = useRouter();
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    fetch("/api/returns")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPolicies(data);
        }
      });
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 text-gray-800 flex flex-col pt-14 bg-white text-black dark:bg-black dark:text-white min-h-screen items-start px-6 md:px-16 lg:px-32 pt-12">
        <div className="flex flex-col mt-8 mb-8">
          <p className="text-3xl font-medium">
            Return <span className="text-orange-600">Policy</span>
          </p>
          <div className="w-28 h-0.5 bg-orange-600 mt-2" />
        </div>

        {policies.length > 0 ? (
          <div className="space-y-8 w-full">
            {policies.map((policy) => (
              <div
                key={policy._id}
                className="space-y-3 border-b pb-6 border-gray-300 dark:border-gray-700"
              >
                <h2 className="text-xl font-semibold">{policy.heading}</h2>
                <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">
                  {policy.subheading}
                </h3>
                <div className="whitespace-pre-line leading-relaxed mt-2">
                  {policy.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No privacy policies available.</p>
        )}
      </div>
      <Footer />
    </>
  );
}





