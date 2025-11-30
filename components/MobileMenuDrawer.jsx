"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Home, Building2, BadgeHelp, Info, Phone, Newspaper, Heart, GitCompare, Folder, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AvatarMenu from "./AvatarMenu";

export default function MobileMenuDrawer({ isOpen, onClose }) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* DARK OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] lg:hidden"
          />


          {/* SLIDE-IN DRAWER */}
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed top-0 right-0 w-80 h-full shadow-2xl z-[1000] flex flex-col bg-white dark:bg-gray-900 overflow-y-auto lg:hidden"
            >

            {/* HEADER */}
            <div className="relative w-full">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" />

            {/* CLOSE BUTTON */}
            <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md"
            >
                <X size={22} className="text-white" />
            </button>

            {/* WELCOME TEXT ONLY IF USER EXISTS */}
            {user && (
                <div className="absolute bottom-4 left-4 text-white font-bold text-xl drop-shadow-lg">
                Welcome, {user.name.split(" ")[0]}
                </div>
            )}
            </div>


            {/* PROFILE */}
            {user && (
              <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <AvatarMenu    />
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{user.email}</span>
                  
                </div>
              </div>
            )}

            {/* MENU ITEMS */}
            <div className="flex flex-col px-6 py-4 text-gray-800 dark:text-gray-200 text-base font-medium gap-2">
              <Link href="/" onClick={onClose} className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-gray-800 hover:text-blue-600 transition">
                <Home size={20} /> Home
              </Link>

              <Link href="/properties" onClick={onClose} className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-gray-800 hover:text-blue-600 transition">
                <Building2 size={20} /> Properties
              </Link>

              <button
                onClick={() => {
                  if (window.location.pathname === "/") {
                    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    router.push("/#services");
                  }
                  onClose();
                }}
                className="flex items-center gap-3 py-3 text-left border-b border-gray-200 dark:border-gray-800 hover:text-blue-600 transition"
              >
                <BadgeHelp size={20} /> Services
              </button>

              <Link href="/about" onClick={onClose} className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-gray-800 hover:text-blue-600 transition">
                <Info size={20} /> About Us
              </Link>

              <Link href="/contact" onClick={onClose} className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-gray-800 hover:text-blue-600 transition">
                <Phone size={20} /> Contact
              </Link>

              <Link href="/blog" onClick={onClose} className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-gray-800 hover:text-blue-600 transition">
                <Newspaper size={20} /> Blog
              </Link>

              {user && user.role === "admin" && (
                <>

                  <div className="pt-4 pb-1 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">My Activity</div>

                  {/* <Link href="/saved" onClick={onClose} className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-gray-800 hover:text-blue-500">
                    <Heart size={20} /> Saved Properties
                  </Link>

                  <Link href="/compare" onClick={onClose} className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-gray-800 hover:text-blue-500">
                    <GitCompare size={20} /> Compare
                  </Link>

                  <Link href="/my-listings" onClick={onClose} className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-gray-800 hover:text-blue-500">
                    <Folder size={20} /> My Listings
                  </Link> */}

                  
                    <Link href="/admin" onClick={onClose} className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-gray-800 text-blue-600 font-semibold">
                      <Shield size={20} /> Admin Dashboard
                    </Link>
                </>

              )}
            </div>

            {/* CTA BUTTON */}
            <div className="mt-auto px-6 py-6">
              <button
                onClick={() => {
                  onClose();
                  router.push("/contact");
                }}
                className="w-full py-3 rounded-md bg-blue-600 text-white text-sm font-medium shadow hover:bg-blue-700 transition-all"
              >
                Schedule a Tour
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
