"use client";

import { useEffect, useRef, useState } from "react";

export default function WhatsAppWidget() {
  const containerRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load Elfsight script once
    if (!document.getElementById("elfsight-script")) {
      const script = document.createElement("script");
      script.src = "https://static.elfsight.com/platform.js";
      script.defer = true;
      script.id = "elfsight-script";
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (scriptLoaded && window.Elfsight && containerRef.current) {
      // Refresh the widget so it attaches to the div
      window.Elfsight.refresh();
    }
  }, [scriptLoaded]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-5 right-5 z-[9999] w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
    >
      {/* Elfsight widget container */}
      <div className="elfsight-app-837a3bbc-d1b9-454f-ae15-61c93db41b36 w-full h-full"></div>
    </div>
  );
}
