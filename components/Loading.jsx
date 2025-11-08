// import React from "react";

// const Loading = ({ message = "Loading..." }) => {
//   return (
//     <div className="flex flex-col justify-center items-center h-[70vh] space-y-6">
//       {/* Box animation */}
//       <div className="flex space-x-2">
//         <div className="h-6 w-6 bg-orange-500 rounded-md animate-bounce" style={{ animationDelay: "0s" }}></div>
//         <div className="h-6 w-6 bg-orange-400 rounded-md animate-bounce" style={{ animationDelay: "0.2s" }}></div>
//         <div className="h-6 w-6 bg-orange-300 rounded-md animate-bounce" style={{ animationDelay: "0.4s" }}></div>
//       </div>

//       {/* Message */}
//       <p className="text-gray-600 text-lg font-medium animate-pulse">{message}</p>
//     </div>
//   );
// };

// export default Loading;

















"use client";
import React from "react";
import { motion } from "framer-motion";

const Loading = ({ message = "Loading" }) => {
  const dots = ["", ".", "..", "..."];

  return (
    <div className="flex flex-col justify-center items-center h-[70vh] space-y-6">
      {/* Animated bouncing boxes */}
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`h-6 w-6 rounded-md ${
              i === 0
                ? "bg-orange-500"
                : i === 1
                ? "bg-orange-400"
                : "bg-orange-300"
            }`}
            animate={{
              y: [0, -14, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 0.4,
              ease: "easeInOut",
              delay: i * 0.25, // ✅ stagger each box
            }}
          />
        ))}
      </div>

      {/* Animated "Loading..." text */}
      <motion.div
        className="text-gray-700 text-lg font-medium flex items-center"
        initial="hidden"
        animate="visible"
      >
        <motion.span
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {message}
        </motion.span>

        {/* Animated dots */}
        <motion.span
          key="dots"
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <AnimatedDots />
        </motion.span>
      </motion.div>
    </div>
  );
};

// Helper for the animated dots (cycles through ".", "..", "...")
const AnimatedDots = () => {
  const [dotIndex, setDotIndex] = React.useState(0);
  const dots = ["", ".", "..", "..."];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % dots.length);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return <span>{dots[dotIndex]}</span>;
};

export default Loading;
