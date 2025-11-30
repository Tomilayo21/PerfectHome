// "use client";

// import { useEffect, useRef, useState } from "react";

// export default function WhatsAppWidget() {
//   const containerRef = useRef(null);
//   const [scriptLoaded, setScriptLoaded] = useState(false);

//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     // Load Elfsight script once
//     if (!document.getElementById("elfsight-script")) {
//       const script = document.createElement("script");
//       script.src = "https://static.elfsight.com/platform.js";
//       script.defer = true;
//       script.id = "elfsight-script";
//       script.onload = () => setScriptLoaded(true);
//       document.body.appendChild(script);
//     } else {
//       setScriptLoaded(true);
//     }
//   }, []);

//   useEffect(() => {
//     if (scriptLoaded && window.Elfsight && containerRef.current) {
//       // Refresh the widget so it attaches to the div
//       window.Elfsight.refresh();
//     }
//   }, [scriptLoaded]);

//   return (
//     <div
//       ref={containerRef}
//       className="fixed bottom-5 right-5 z-[9999] w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
//     >
//       {/* Elfsight widget container */}
//       <div className="elfsight-app-837a3bbc-d1b9-454f-ae15-61c93db41b36 w-full h-full"></div>
//     </div>
//   );
// }




































"use client";

import { useState } from "react";

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      <a
        href="https://wa.me/08100515622"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M20.52 3.478a11.86 11.86 0 00-16.76 0c-4.63 4.63-4.69 12.17-.17 16.65l-2.17 6.58 6.8-2.18c4.48 4.53 12.05 4.47 16.68-.16a11.86 11.86 0 000-16.76zm-8.7 17.97a9.76 9.76 0 01-5.15-1.5l-.37-.22-4.05 1.29 1.3-4.03-.23-.37a9.73 9.73 0 011.44-11.88 9.76 9.76 0 0114.08 0 9.76 9.76 0 010 14.08 9.76 9.76 0 01-9.02 3.63zm5.38-7.23c-.29-.14-1.71-.84-1.98-.94-.27-.1-.47-.14-.67.14s-.77.94-.95 1.13c-.18.18-.36.2-.66.07-.29-.14-1.23-.45-2.35-1.45-.87-.77-1.46-1.72-1.63-2 .17-.28.03-.43-.12-.57-.12-.13-.27-.36-.41-.54-.14-.18-.19-.3-.28-.5-.09-.2-.05-.38.03-.53.09-.14.67-1.62.92-2.21.24-.58.49-.5.67-.51.17-.01.37-.01.57-.01.19 0 .5.07.76.36.26.28.88.87.95.93.07.06.12.1.18.16.06.06.1.12.15.19.05.06.03.11.05.18.02.06.04.15.01.22-.03.07-.27.67-.38.91-.12.24-.24.26-.42.37-.17.11-.36.26-.52.37-.17.11-.29.19-.42.31-.13.12-.26.24-.09.46.17.21.76 1.16 1.63 1.92.87.76 1.57 1.03 1.79 1.15.22.11.35.1.48-.06.13-.17.56-.65.7-.87.14-.22.28-.18.48-.11.2.07 1.27.6 1.49.71.22.11.37.17.42.27.05.1.05.57-.24.71z" />
        </svg>
      </a>
    </div>
  );
}
