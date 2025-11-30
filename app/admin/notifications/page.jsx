"use client";

import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  ShoppingCart,
  Package,
  UserPlus,
  CreditCard,
  AlertTriangle,
  Star,
  Bell,
  Mail,
} from "lucide-react";

const POLL_INTERVAL = 30000;

const typeConfig = {
  order: { icon: <ShoppingCart className="w-5 h-5" />, color: "bg-blue-100" },
  stock: { icon: <Package className="w-5 h-5" />, color: "bg-red-100" },
  user: { icon: <UserPlus className="w-5 h-5" />, color: "bg-green-100" },
  payment: { icon: <CreditCard className="w-5 h-5" />, color: "bg-yellow-100" },
  review: { icon: <Star className="w-5 h-5" />, color: "bg-purple-100" },
  system: { icon: <AlertTriangle className="w-5 h-5" />, color: "bg-gray-100" },
  promo: { icon: <Bell className="w-5 h-5" />, color: "bg-indigo-100" },
  message: { icon: <Mail className="w-5 h-5" />, color: "bg-red-100" },
  mail: { icon: <Mail className="w-5 h-5" />, color: "bg-red-100" },
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastNotificationIds = useRef(new Set());

  // Fetch notifications
  async function fetchNotifications(showToast = false) {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.success) {
        const currentIds = new Set(data.data.map((n) => n._id));
        const newIds = [...currentIds].filter(
          (id) => !lastNotificationIds.current.has(id)
        );

        if (showToast && newIds.length > 0) {
          toast.success(`You have ${newIds.length} new notification(s)!`);
        }

        lastNotificationIds.current = currentIds;
        setNotifications(data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  async function markAsRead(id) {
    // Optimistically mark as read in UI
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }), // ✅ send correct id
      });

      const data = await res.json();
      if (!data.success) {
        console.error("Failed to update:", data.error);
      }
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  }

  async function handleNotificationClick(notif) {
    await markAsRead(notif._id); // ✅ ensures DB is updated
    // Then navigate
    switch (notif.type) {
      case "order":
        window.location.href = `/admin/orders/${notif.relatedId}`;
        break;
      case "stock":
        window.location.href = `/admin/products/${notif.relatedId}`;
        break;
      case "user":
        window.location.href = `/admin/users/${notif.relatedId}`;
        break;
      case "review":
        window.location.href = `/admin/reviews/${notif.relatedId}`;
        break;
      case "message":
      case "mail":
        window.location.href = `/admin/messages`;
        break;
      default:
        console.log("No action defined for this type.");
    }
  }


  return (
    <div className="p-4 sm:p-6 bg-white rounded shadow border dark:bg-black dark:text-gray-300">
      <h1 className="text-2xl font-semibold mb-4">Notifications</h1>

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notif) => {
            const config = typeConfig[notif.type] || typeConfig.system;
            return (
              <li
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`cursor-pointer flex items-start gap-3 p-3 rounded-md transition ${
                  notif.isRead
                    ? "bg-gray-50 dark:bg-gray-900"
                    : config.color + " border-l-4 border-indigo-500"
                } hover:shadow-md hover:scale-[1.01] duration-150`}
              >
                <div className="mt-1">{config.icon}</div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      notif.isRead ? "text-gray-700" : "text-black"
                    }`}
                  >
                    {notif.message}
                  </p>
                  <small className="text-gray-500">
                    {new Date(notif.createdAt).toLocaleString()}
                  </small>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
