"use client";
import { motion, useViewportScroll, useTransform } from "framer-motion";

export default function ParallaxFadeIn({ children, speed = 0.2 }) {
  const { scrollYProgress } = useViewportScroll();
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  return (
    <motion.div style={{ y, opacity: scrollYProgress }}>
      {children}
    </motion.div>
  );
}
