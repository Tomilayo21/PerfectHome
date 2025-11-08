"use client";
import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

/**
 * HOC for reusable scroll-based animations.
 * 
 * @param {React.Component} WrappedComponent - The component to animate.
 * @param {Object} options - Animation options.
 * @param {string} options.type - "fade" | "slide" | "scale"
 * @param {string} options.direction - "up" | "down" | "left" | "right" (for slide)
 * @param {number} options.delay - Animation delay in seconds.
 */
export function withAnimation(
  WrappedComponent,
  { type = "fade", direction = "up", delay = 0 } = {}
) {
  return function AnimatedComponent(props) {
    const controls = useAnimation();
    const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });

    useEffect(() => {
      if (inView) controls.start("visible");
    }, [inView, controls]);

    // Motion variants
    const variants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    };

    if (type === "slide") {
      const offset =
        direction === "left"
          ? -80
          : direction === "right"
          ? 80
          : direction === "down"
          ? -80
          : 80;
      variants.hidden = { opacity: 0, x: direction === "left" || direction === "right" ? offset : 0, y: direction === "up" || direction === "down" ? offset : 0 };
      variants.visible = { opacity: 1, x: 0, y: 0 };
    } else if (type === "scale") {
      variants.hidden = { opacity: 0, scale: 0.9 };
      variants.visible = { opacity: 1, scale: 1 };
    }

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={variants}
        transition={{ duration: 0.6, ease: "easeOut", delay }}
      >
        <WrappedComponent {...props} />
      </motion.div>
    );
  };
}






// // Fade in from bottom
// export default withAnimation(Hero, { type: "fade", direction: "up" });

// // Scale up (for CTA or banners)
// export default withAnimation(PromoBanner, { type: "scale" });

// // Slide from right (for testimonials or images)
// export default withAnimation(Testimonials, { type: "slide", direction: "right", delay: 0.2 });
