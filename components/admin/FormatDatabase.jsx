"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader2, AlertTriangle } from "lucide-react";

export default function FormatDatabaseButton() {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";
  // const [isAdmin, setIsAdmin] = useState(false);
  const isAdmin = session?.user?.role === 'admin';
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


  const verifyPassword = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/format-database/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setShowPasswordModal(false);
        setShowConfirmModal(true);
      } else {
        const err = await res.json();
        toast.error(err.error || "Invalid password");
      }
    } catch {
      toast.error("Failed to verify password");
    } finally {
      setLoading(false);
    }
  };

  const handleFormat = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/format-database", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Database formatted successfully. Non-admin users logged out.");
        setShowConfirmModal(false);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to format database");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <>
      <button
        className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-5 py-2.5 rounded-lg shadow hover:from-red-700 hover:to-orange-700 transition-all"
        onClick={() => setShowPasswordModal(true)}
      >
        <AlertTriangle className="w-4 h-4" />
        Format Database
      </button>

      {/* Password Modal */}
      {showPasswordModal && (
        <Modal onClose={() => setShowPasswordModal(false)}>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Admin Verification</h2>
          <p className="text-sm text-gray-600 mb-4">
            Please enter your admin password to continue.
          </p>

          <input
            type="password"
            placeholder="Enter admin password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </button>
            <button
              onClick={verifyPassword}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Next
            </button>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <Modal onClose={() => setShowConfirmModal(false)}>
          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="w-10 h-10 text-red-600 mb-3" />
            <h2 className="text-lg font-semibold text-red-600">
              Irreversible Action
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              This will permanently delete all non-admin data and log everyone out.
              This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </button>
            <button
              onClick={handleFormat}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Delete
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ✅ Reusable modal wrapper with backdrop + animation
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-slideUp">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
