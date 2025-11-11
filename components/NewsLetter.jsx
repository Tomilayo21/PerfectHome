"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";



const NewsLetter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

   const handleSubscribe = async () => {
    setLoading(true);
    setMessage("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.alreadySubscribed) {
          setMessage("You're already subscribed to our newsletter.");
        } else {
          setMessage("Subscribed successfully! Check your email for confirmation.");
          setEmail("");
        }
      } else {
        setMessage(data.error || "Subscription failed.");
      }
    } catch (err) {
      setMessage("Something went wrong.");
    }

    setLoading(false);
  };


  return (
    <div className="flex flex-col items-center mb-12 
      justify-center text-center space-y-4 pt-12 pb-16 
      relative overflow-hidden">

      {/* Decorative Illustration */}
      <img
        src="/subscribe.png"
        alt="Newsletter Illustration"
        className="absolute top-0 right-0 w-32 md:w-48 opacity-20 pointer-events-none"
      />

      {/* Headline */}
      <h3 className="text-3xl sm:text-4xl font-bold mb-4">
          Subscribe to Our Newsletter
      </h3>
      <p className="text-gray-600 mb-8 text-lg sm:text-lg">
        Stay updated with the latest property listings and real estate trends.
      </p>

      {/* Subscription Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubscribe();
        }}
        className="flex flex-col md:flex-row items-center gap-3 md:gap-0 max-w-2xl w-full z-10 px-4"
      >
        <div className="relative flex-1 group w-full">
          {/* Mail Icon */}
          <Mail
            className="absolute left-3 top-1/2 transform 
            -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 
            transition-all duration-300 group-focus-within:animate-pulse
          "
            size={20}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="pl-10 pr-4 py-3 md:py-4 w-full rounded-md 
              md:rounded-l-md md:rounded-r-none border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-orange-500 
              dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all
            "
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto md:px-12 px-8 py-3 
          md:py-4 bg-blue-600 text-white font-normal 
          rounded-md md:rounded-r-md md:rounded-l-none 
          transition-all transform hover:scale-105 hover:shadow-lg 
          hover:shadow-blue-400/50 disabled:opacity-50
        "
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {/* Feedback Message */}
      {message && (
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 z-10">{message}</p>
      )}
    </div>
  );
};

export default NewsLetter;
