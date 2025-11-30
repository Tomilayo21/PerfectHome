"use client";
import { useEffect, useState } from "react";
import { Megaphone, Phone } from "lucide-react";

const PromoBanner = () => {
  const messages = [
    "🔥 Flash Sale! Up to 50% off on all electronics!",
    "📞 Call for exclusive deals: +234 800 123 4567",
    "🚚 Free shipping on orders over ₦20,000!",
  ];

  const [current, setCurrent] = useState(0);

  // Rotate messages every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 text-white text-sm md:text-base font-medium shadow-md">
      <div className="flex items-center justify-center py-2 px-4 gap-2 animate-pulse">
        <Megaphone className="w-4 h-4 md:w-5 md:h-5" />
        <span className="transition-all duration-700 ease-in-out text-center">
          {messages[current]}
        </span>
      </div>
    </div>
  );
};

export default PromoBanner;
