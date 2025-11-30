// components/AdjustNavbarHeight.jsx
"use client";

import { useLayoutEffect } from "react";

export default function AdjustNavbarHeight() {
  useLayoutEffect(() => {
    let mounted = true;
    const setVar = (height) => {
      document.documentElement.style.setProperty("--navbar-height", `${height}px`);
      console.log("[AdjustNavbarHeight] set --navbar-height =", height);
    };

    const attach = (el) => {
      if (!el) return false;
      // initial set
      setVar(el.offsetHeight || 0);
      // observe changes
      let ro;
      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => setVar(el.offsetHeight || 0));
        ro.observe(el);
      } else {
        const onResize = () => setVar(el.offsetHeight || 0);
        window.addEventListener("resize", onResize);
      }
      return () => {
        if (ro) ro.disconnect();
        else window.removeEventListener("resize", onResize);
      };
    };

    let cleanUp = null;
    let attempts = 0;
    const tryAttach = () => {
      if (!mounted) return;
      const el = document.getElementById("main-navbar");
      if (el) {
        cleanUp = attach(el);
      } else if (attempts < 10) {
        attempts += 1;
        setTimeout(tryAttach, 150 * attempts); // retry with backoff
      } else {
        console.warn("[AdjustNavbarHeight] could not find #main-navbar");
      }
    };

    tryAttach();

    return () => {
      mounted = false;
      if (typeof cleanUp === "function") cleanUp();
    };
  }, []);

  return null;
}
