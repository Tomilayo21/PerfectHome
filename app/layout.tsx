"use client";

import React, { ReactNode } from "react";
import "./globals.css";
import { Outfit } from "next/font/google";
import { AppContextProvider } from "@/context/AppContext";
import AnalyticsTracker from "@/components/admin/AnalyticsTracker";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import Script from "next/script";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={outfit.className}>
      <body className="antialiased">
        <SessionProvider>
          <AppContextProvider>
            <Toaster position="top-right" />
            <AnalyticsTracker>{children}</AnalyticsTracker>
          </AppContextProvider>
        </SessionProvider>

        {/* Elfsight Script — works correctly in TSX */}
        <Script
          src="https://static.elfsight.com/platform/platform.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
