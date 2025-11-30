"use client";

import { useEffect } from "react";

export default function WhatsAppWidget() {
  useEffect(() => {
    if (!document.querySelector("#elfsight-script")) {
      const script = document.createElement("script");
      script.src = "https://static.elfsight.com/platform.js";
      script.defer = true;
      script.id = "elfsight-script";
      document.body.appendChild(script);

      script.onload = () => {
        if (window.Elfsight) {
          window.Elfsight.refresh();
        }
      };
    }
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28">
      <div className="elfsight-app-837a3bbc-d1b9-454f-ae15-61c93db41b36 w-full h-full"></div>

      {/* Hide admin-only tooltip */}
      <style jsx global>{`
        .eapps-widget-toolbar-panel-wrapper,
        .eapps-widget-toolbar-panel-only-you {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
