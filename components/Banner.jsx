// import React from "react";
// import { assets } from "@/assets/assets";
// import Image from "next/image";
// import { useRouter } from "next/navigation";

// const Banner = () => {
//   const router = useRouter();
  

//   return (
//     <div
//       className="
//         flex flex-col md:flex-row items-center justify-between 
//         md:pl-20 py-14 md:py-0 my-16 rounded-2xl overflow-hidden 
//         bg-gradient-to-r from-[#E6E9F2] to-[#F4F6FA] 
//         dark:from-transparent dark:to-transparent
//         border border-gray-200 dark:border-gray-700 shadow-sm
//       "
//     >
//       {/* Left Product Image */}
//       <Image
//         className="max-w-56 md:max-w-64 drop-shadow-md"
//         src={assets.jbl_soundbox_image}
//         alt="jbl_soundbox_image"
//       />

//       {/* Text + Button */}
//       <div className="flex flex-col items-center md:items-start justify-center text-center md:text-left space-y-4 px-6 md:px-0">
//         <h2 className="text-3xl md:text-4xl font-bold leading-snug text-gray-900 dark:text-white">
//           Game On: <span className="text-orange-600">Next-Level Action</span>
//         </h2>
//         <p className="max-w-md text-base md:text-lg font-medium text-gray-700/70 dark:text-gray-400">
//           Immersive audio meets precise controls—your winning combo.
//         </p>
//         <button
//           onClick={() => router.push("/all-products")}
//           className="
//             group flex items-center justify-center gap-2 px-8 py-3 
//             bg-orange-600 hover:bg-orange-700 
//             rounded-xl text-white font-medium text-lg
//             shadow-md hover:shadow-lg transition
//           "
//         >
//           Check Out
//           <Image
//             className="w-5 h-5 group-hover:translate-x-1 transition-transform"
//             src={assets.arrow_icon_white}
//             alt="arrow_icon_white"
//           />
//         </button>
//       </div>

//       {/* Right Product Image */}
//       <Image
//         className="hidden md:block max-w-80 drop-shadow-md"
//         src={assets.md_controller_image}
//         alt="md_controller_image"
//       />
//       <Image
//         className="md:hidden w-56"
//         src={assets.sm_controller_image}
//         alt="sm_controller_image"
//       />
//     </div>

//   );
// };

// export default Banner;


































"use client";

import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Banner = () => {
  const router = useRouter();

  // Set countdown timer to 6 hours from now
  const offerEnd = new Date(Date.now() + 6 * 60 * 60 * 1000);

  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = offerEnd.getTime() - now;

      if (distance <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="
        flex flex-col md:flex-row items-center justify-between 
        md:pl-20 py-14 px-5 md:py-0 my-16 overflow-hidden 
        bg-gray-700 dark:bg-gray-900
        bg-gradient-to-r from-gray-100 to-gray-50
        dark:from-gray-900 dark:to-gray-800
        lg:px-32
      "

    >
      {/* Left Product Image */}
      <Image
        className="max-w-56 md:max-w-64 drop-shadow-lg"
        src={assets.jbl_soundbox_image}
        alt="jbl_soundbox_image"
      />

      {/* Center Content */}
      <div className="flex flex-col items-center md:items-start justify-center text-center md:text-left px-6 md:px-0 space-y-4">

        {/* Title */}
        <h2 className="text-3xl md:text-5xl font-semibold leading-snug text-gray-900 dark:text-white">
          Special sale of <span className="text-orange-600">30%</span> Off!
        </h2>

        {/* Subtitle */}
        <p className="max-w-md text-base md:text-lg font-medium text-gray-700/70 dark:text-gray-400">
          Grab this limited-time offer before it’s gone.
        </p>

        {/* Countdown Timer */}
        <div className="flex justify-center md:justify-start gap-3 mb-2">
          {[
            { label: "Hrs", value: timeLeft.hours },
            { label: "Min", value: timeLeft.minutes },
            { label: "Sec", value: timeLeft.seconds },
          ].map((unit, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 border border-orange-200 dark:border-gray-700 rounded-lg w-14 h-14 shadow-sm"
            >
              <span className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                {String(unit.value).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-gray-500">{unit.label}</span>
            </div>
          ))}
        </div>

        {/* Shop Button */}
        <button
          onClick={() => router.push("/all-products")}
          className="
            group flex items-center justify-center gap-2 px-8 py-3 
            bg-orange-600 hover:bg-orange-700 
            rounded-full text-white font-light text-lg
            shadow-md hover:shadow-lg transition
          "
        >
          Shop Now
          <Image
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            src={assets.arrow_icon_white}
            alt="arrow_icon_white"
          />
        </button>
      </div>

      {/* Right Product Image */}
      {/* <div className="relative">
        <Image
          className="hidden md:block max-w-80 drop-shadow-lg"
          src={assets.md_controller_image}
          alt="md_controller_image"
        />
        <Image
          className="md:hidden w-56"
          src={assets.sm_controller_image}
          alt="sm_controller_image"
        />
      </div> */}
    </div>
  );
};

export default Banner;
