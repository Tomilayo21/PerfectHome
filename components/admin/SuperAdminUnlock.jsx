"use client";

import { useState } from "react";

export default function SuperAdminUnlock({ onSuccess, onCancel }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    if (e) e.preventDefault(); // Prevent form refresh
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/verify-admin-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess(); // Grant access
      } else {
        setError("Incorrect password.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-md shadow-2xl max-w-md w-full p-6 relative">
        {/* Form wrapper */}
        <form onSubmit={handleVerify}>
          {/* Header */}
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">
            Admin Verification
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 text-center">
            Please enter your password to continue.
          </p>

          {/* Password Input */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin Password"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3 dark:bg-gray-700 dark:text-gray-100"
          />

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm mb-3 text-center font-medium">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:scale-101 transform transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
