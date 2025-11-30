"use client";

import { useEffect } from "react";

export default function WhatsAppWidget() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load Elfsight script only once
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
    } else if (window.Elfsight) {
      window.Elfsight.refresh();
    }
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24">
      <div className="elfsight-app-837a3bbc-d1b9-454f-ae15-61c93db41b36 w-full h-full"></div>

      {/* Hide admin tooltip and reduce hover effects */}
      <style jsx global>{`
        .eapps-widget-toolbar-panel-wrapper,
        .eapps-widget-toolbar-panel-only-you,
        .eapps-widget-toolbar-panel {
          display: none !important;
        }
        .eapps-widget {
          pointer-events: auto !important; /* allow normal clicks */
        }
        iframe[src*="elfsight"] {
          pointer-events: auto !important;
        }
      `}</style>
    </div>
  );
}
