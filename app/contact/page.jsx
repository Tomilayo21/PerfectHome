"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageCircle } from "lucide-react";


const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Submission failed");

      setResponse({ type: "success", message: "Message sent successfully!" });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setResponse({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

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

      <div className="flex flex-col items-center pb-18
          px-6 md:px-16 lg:px-32 pt-[calc(var(--navbar-height)+1rem)] bg-gray-50 dark:bg-gray-50
        ">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4 space-x-2">
            <p className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-900">
              Contact Us
            </p>
          </div>
          <p className="text-gray-900 dark:text-gray-900 max-w-xl mx-auto">
            Have a question or want to collaborate? Fill out the form below and we’ll get back to you as soon as possible.
          </p>
        </div>

        {/* Form */}
        <div className="w-full max-w-2xl bg-gray-50 dark:bg-gray-50 border border-black shadow-lg rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-black text-black placeholder-black rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-black text-black placeholder-black rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
            />

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-black text-black placeholder-black rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
            />

            <textarea
              name="message"
              placeholder="Your Message"
              rows={6}
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-black text-black placeholder-black rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition resize-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg 
                        shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>

            {response && (
              <p
                className={`mt-3 text-center font-medium ${
                  response.type === "error" ? "text-red-500" : "text-green-600"
                }`}
              >
                {response.message}
              </p>
            )}
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContactPage;
