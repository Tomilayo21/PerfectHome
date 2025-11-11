"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  LayoutDashboard,
  Settings,
  Package,
  Database,
  LogOut as LogOutIcon,
  Menu as MenuIcon, // ✅ Menu icon for mobile toggle
} from "lucide-react";
import { UsersIcon, ChartPieIcon } from "@heroicons/react/24/outline";
import { RiMoneyDollarCircleLine, RiFeedbackLine } from "react-icons/ri";
import { useSession, signOut } from "next-auth/react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import PasswordConfirmPopup from "./PasswordConfirmPopup";

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: "Users Management", path: "/admin/users", icon: <UsersIcon className="w-5 h-5" /> },
  { name: "Products", path: "/admin/products", icon: <Package className="w-5 h-5" /> },
  { name: "Payments & Orders", path: "/admin/payments", icon: <RiMoneyDollarCircleLine className="w-5 h-5" /> },
  { name: "Messages & Feedback", path: "/admin/messages", icon: <RiFeedbackLine className="w-5 h-5" /> },
  { name: "Analytics", path: "/admin/analytics", icon: <ChartPieIcon className="w-5 h-5" /> },
  { name: "Notifications", path: "/admin/notifications", icon: <Bell className="w-5 h-5" /> },
  { name: "System Backup", path: "/admin/backup", icon: <Database className="w-5 h-5" /> },
  { name: "Settings", path: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const readNotificationsRef = useRef(false);
  const readMessagesRef = useRef(false);

  // ===== Fetch unread notifications =====
  const fetchUnreadNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.success) {
        const unreadCount = data.data.filter((n) => !n.isRead).length;
        setUnreadNotifications((prev) =>
          prev !== unreadCount ? unreadCount : prev
        );
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  // ===== Fetch unread messages =====
  const fetchUnreadMessages = async () => {
    try {
      const res = await fetch("/api/contact/messages?view=unread");
      const data = await res.json();
      const unreadCount = Array.isArray(data) ? data.length : 0;
      setUnreadMessages((prev) =>
        prev !== unreadCount ? unreadCount : prev
      );
    } catch (err) {
      console.error("Failed to fetch unread messages", err);
    }
  };

  // ===== Poll every 30s, only update when counts change =====
  useEffect(() => {
    fetchUnreadNotifications();
    fetchUnreadMessages();
    const interval = setInterval(() => {
      fetchUnreadNotifications();
      fetchUnreadMessages();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const confirmLogout = (password) => {
    if (password === process.env.NEXT_PUBLIC_LOGOUT_PASSWORD) {
      signOut({ callbackUrl: "/" });
      toast.success("Signed out successfully");
    } else {
      toast.error("Incorrect password");
    }
    setShowPopup(false);
  };

  const handleMenuClick = (itemName) => {
    if (itemName === "Notifications") readNotificationsRef.current = true;
    if (itemName === "Messages & Feedback") readMessagesRef.current = true;
    setMobileOpen(false);
  };

  const renderBadge = (itemName) => {
    if (itemName === "Notifications" && unreadNotifications > 0 && !readNotificationsRef.current) {
      return <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />;
    }
    if (itemName === "Messages & Feedback" && unreadMessages > 0 && !readMessagesRef.current) {
      return <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />;
    }
    return null;
  };

  const renderMenu = () => (
    <ul className="space-y-1">
      {menuItems.map((item, idx) => {
        const active = pathname === item.path;
        return (
          <li key={idx}>
            <Link href={item.path} prefetch={false} onClick={() => handleMenuClick(item.name)}>
              <div
                className={`flex items-center gap-3 px-5 py-3 text-sm rounded-md transition-all duration-200 cursor-pointer ${
                  active
                    ? "bg-orange-100 dark:bg-orange-900 text-orange-600 border-l-4 border-orange-600"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {renderBadge(item.name)}
                </div>
                {item.name}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const renderFooter = () => (
    <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
      {session?.user ? (
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gray-200 dark:bg-gray-700 w-8 h-8 flex items-center justify-center font-semibold text-gray-700 dark:text-gray-200">
            {session.user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-800 dark:text-gray-100">{session.user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Signed in</p>
          </div>
        </div>
      ) : (
        <Link
          href="/signup"
          prefetch={false}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 transition"
        >
          <UsersIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium">Sign In</span>
        </Link>
      )}

      {session?.user && (
        <button
          onClick={() => setShowPopup(true)}
          className="flex items-center gap-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 px-4 py-2 rounded-md transition w-full"
        >
          <LogOutIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      )}

      {showPopup && (
        <PasswordConfirmPopup onClose={() => setShowPopup(false)} onConfirm={confirmLogout} />
      )}
    </div>
  );

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex flex-col h-screen w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 fixed left-0 top-0">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Admin Panel</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">System Management</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">{renderMenu()}</nav>
        {renderFooter()}
      </aside>

      {/* ===== MOBILE SIDEBAR BUTTON ===== */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white dark:bg-gray-900 p-2 rounded shadow border"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        <MenuIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      </button>

      {/* ===== MOBILE SIDEBAR SLIDE-IN ===== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 left-0 z-50 bg-white dark:bg-black w-64 h-full shadow-xl border-r border-gray-200 dark:border-gray-800 flex flex-col"
            >
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Admin Menu</h2>
              </div>
              <nav className="flex-1 overflow-y-auto py-4">{renderMenu()}</nav>
              {renderFooter()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
