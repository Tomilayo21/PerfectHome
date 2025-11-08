"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useAppContext } from "@/context/AppContext";
import { assets } from "@/assets/assets";
import SearchBar from "./Searchbar";
import AvatarMenu from "./AvatarMenu";
import Signup from "@/components/Signup";

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

  // Prevent SSR flash
  useEffect(() => setMounted(true), []);

  // Scroll detection
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
        console.log("Fetched settings:", data);
        setLightLogoUrl(data.settings?.lightLogoUrl || data.lightLogoUrl || null);
        setDarkLogoUrl(data.settings?.darkLogoUrl || data.darkLogoUrl || null);
      } catch (err) {
        console.error("Failed to fetch logos", err);
      }
    };
    fetchLogos();
  }, []);

  const logoSrc = themeMode === "dark" ? darkLogoUrl || lightLogoUrl : lightLogoUrl || darkLogoUrl;
  
  // Close modal on ESC
  const handleEsc = useCallback((e) => {
    if (e.key === "Escape") setShowSignup(false);
  }, []);

  useEffect(() => {
    if (showSignup) window.addEventListener("keydown", handleEsc);
    else window.removeEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showSignup, handleEsc]);

  if (!mounted) return null;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 backdrop-blur-md ${
          isScrolled
            ? themeMode === "dark"
              ? "bg-black/80 border-b border-gray-700 shadow-lg"
              : "bg-white/80 border-b border-gray-200 shadow-lg"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 md:px-16 lg:px-32">

          {/* Logo */}
          {/* <img
            key={themeMode}
            src={logoSrc || "/default-logo.png"}
            alt="logo"
            width={100}
            height={100}
            onClick={() => router.push("/")}
            className="cursor-pointer w-24 md:w-32 hidden md:block hover:scale-105 transition-transform duration-200"
          /> */}

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Link href="/" className="hover:text-orange-500 transition">Home</Link>
            <Link href="/properties" className="hover:text-orange-500 transition">Properties</Link>
            <Link href="/services" className="hover:text-orange-500 transition">Services</Link>
            <Link href="/projects" className="hover:text-orange-500 transition">Projects</Link>
            <Link href="/about" className="hover:text-orange-500 transition">About Us</Link>
            <Link href="/contact" className="hover:text-orange-500 transition">Contact</Link>
            <Link href="/blog" className="hover:text-orange-500 transition">Blog</Link>
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-4">
            <SearchBar />

            {user ? (
              <>
                {user?.role === "admin" && (
                  <button
                    onClick={() => router.push("/admin")}
                    className="px-3 py-1.5 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600 transition"
                  >
                    Admin
                  </button>
                )}
                <AvatarMenu />
              </>
            ) : (
              <button
                onClick={() => router.push("/signup")}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Admin Sign In
              </button>
            )} 

          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden flex items-center justify-center w-8 h-8"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="text-gray-800 dark:text-gray-100" size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="text-gray-800 dark:text-gray-100" size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden flex flex-col gap-4 px-6 pb-6 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800"
            >
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link href="/properties" onClick={() => setMobileMenuOpen(false)}>Properties</Link>
              <Link href="/services" onClick={() => setMobileMenuOpen(false)}>Services</Link>
              <Link href="/projects" onClick={() => setMobileMenuOpen(false)}>Projects</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>Blog</Link>

              {user ? (
                <>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => {
                        router.push("/admin");
                        setMobileMenuOpen(false);
                      }}
                      className="mt-2 px-3 py-2 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600"
                    >
                      Admin Dashboard
                    </button>
                  )}
                  <AvatarMenu />
                </>
              ) : (
                <button
                  onClick={() => {
                    router.push("/signin");
                    setMobileMenuOpen(false);
                  }}
                  className="mt-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Admin Sign In
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Admin SignIn Modal (if needed) */}
      {showSignup && <Signup onClose={() => setShowSignup(false)} mode="signin" />}
    </>
  );
};

export default Navbar;
