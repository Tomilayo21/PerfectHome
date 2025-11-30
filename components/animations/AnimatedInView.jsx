"use client";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

const variantsMap = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
};

export default function AnimatedInView({
  children,
  type = "fade",
  delay = 0,
  duration = 0.6,
  once = true,
  threshold = 0.2,
  className = "",
}) {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: once, threshold });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  const chosenVariant = variantsMap[type] || variantsMap.fade;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={chosenVariant}
      transition={{ delay, duration, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
