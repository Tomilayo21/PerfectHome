"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AnalyticsTracker({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Send a page_view event whenever the route changes
    fetch("/api/analytics/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "page_view", path: pathname }),
    }).catch((err) => console.error("Analytics log failed:", err));
  }, [pathname]);

  return <>{children}</>;
}
