"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useAppContext } from "@/context/AppContext";
import AvatarMenu from "./AvatarMenu";
import Signup from "@/components/Signup";
import MobileMenuDrawer from "@/components/MobileMenuDrawer";

const Navbar = () => {
  const router = useRouter();
  const { themeMode } = useAppContext();
  const { data: session } = useSession();
  const user = session?.user;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [lightLogoUrl, setLightLogoUrl] = useState(null);
  const [darkLogoUrl, setDarkLogoUrl] = useState(null);
    const [logoWidth, setLogoWidth] = useState("120px");
    const [logoHeight, setLogoHeight] = useState("auto");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch logos
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setLightLogoUrl(data.settings?.lightLogoUrl || data.lightLogoUrl || null);
        setDarkLogoUrl(data.settings?.darkLogoUrl || data.darkLogoUrl || null);
        setLogoWidth(data.logoWidth || "120px");
        setLogoHeight(data.logoHeight || "auto");
      } catch (err) {
        console.error("Failed to fetch logos", err);
      }
    };
    fetchLogos();
  }, []);

  const logoSrc =
    themeMode === "dark"
      ? darkLogoUrl || lightLogoUrl
      : lightLogoUrl || darkLogoUrl;

  // ESC close for modal
  const handleEsc = useCallback((e) => {
    if (e.key === "Escape") setShowSignup(false);
  }, []);

  useEffect(() => {
    if (showSignup) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showSignup, handleEsc]);

  useEffect(() => {
    const navbar = document.getElementById("main-navbar");

    if (!navbar) return;

    const updateHeight = () => {
      const height = navbar.offsetHeight;
      document.documentElement.style.setProperty("--navbar-height", height + "px");
    };

    // Run immediately
    updateHeight();

    // Update when resizing
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, [logoWidth, logoHeight, lightLogoUrl, darkLogoUrl]);


  if (!mounted) return null;

  return (
    <>
      <nav
        id="main-navbar"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300  ${
          isScrolled
            ? "bg-gray-900 text-white border-b border-blue-900/70 shadow-lg"
            : "bg-transparent text-black"
        }`}
      >
        <div className="flex items-center justify-between px-4 md:px-16 lg:px-32 py-2 md:py-4 min-h-[60px]">

          {/* LOGO */}
          <img
            key={themeMode}
            src={logoSrc || "/default-logo.png"}
            alt="logo"
            onClick={() => router.push("/")}
            className="cursor-pointer hover:scale-105 transition-transform duration-200"
            style={{ width: logoWidth, height: logoHeight }}
          />

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Link href="/" className="hover:text-blue-400 transition">Home</Link>
            <Link href="/properties" className="hover:text-blue-400 transition">Properties</Link>

            <button
              onClick={() => {
                if (window.location.pathname === "/") {
                  document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
                } else {
                  router.push("/#services");
                }
              }}
              className="hover:text-blue-400 transition"
            >
              Services
            </button>

            <Link href="/about" className="hover:text-blue-400 transition">About Us</Link>
            <Link href="/contact" className="hover:text-blue-400 transition">Contact</Link>
            <Link href="/blog" className="hover:text-blue-400 transition">Blog</Link>

            {user && <AvatarMenu />}
          </div>

          {/* DESKTOP CTA */}
          <div className="hidden md:flex items-center">
            <button
              onClick={() => router.push("/contact")}
              className="px-5 py-2 rounded-sm bg-blue-600 text-white shadow hover:bg-blue-800 transition-all text-sm"
            >
              Schedule a Tour
            </button>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex items-center justify-center w-9 h-9"
          >
            <Menu className="text-white" size={28} />
          </button>
        </div>
      </nav>

      {/* ⭐ SEPARATE DRAWER COMPONENT ⭐ */}
      <MobileMenuDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
      />

      {showSignup && <Signup onClose={() => setShowSignup(false)} mode="signin" />}
    </>
  );
};

export default Navbar;
