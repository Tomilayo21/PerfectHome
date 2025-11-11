"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminSettings from "@/components/admin/AdminSettings";
import SuperAdminUnlock from "@/components/admin/SuperAdminUnlock"; // ✅ import your unlock component

export default function AdminPage() {
  const { data: session, status } = useSession();

  const [isVerified, setIsVerified] = useState(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("general");
  const [userPanel, setUserPanel] = useState("main");
  const [orderPanel, setOrderPanel] = useState(null);

  // ✅ Admin password verification logic
  useEffect(() => {
    if (status === "loading") return;

    const verified = sessionStorage.getItem("superAdminVerified");
    if (!verified) {
      setShowUnlockPrompt(true);
    } else {
      setIsVerified(true);
    }
  }, [status]);

  const handleUnlockSuccess = () => {
    sessionStorage.setItem("superAdminVerified", "true");
    setIsVerified(true);
    setShowUnlockPrompt(false);
  };

  // ✅ Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        Loading admin session...
      </div>
    );
  }

  // ✅ Show unlock prompt (password modal)
  if (showUnlockPrompt) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 flex items-center justify-center">
        <SuperAdminUnlock
          onSuccess={handleUnlockSuccess}
          onCancel={() => setShowUnlockPrompt(false)}
        />
      </div>
    );
  }

  // ✅ Only render dashboard after verification
  if (!isVerified) return null;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {activeView === "dashboard" && (
        <AdminDashboard
          setActiveView={setActiveView}
          setActiveTab={setActiveTab}
          setUserPanel={setUserPanel}
          setOrderPanel={setOrderPanel}
        />
      )}

      {activeView === "settings" && (
        <AdminSettings
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userPanel={userPanel}
          setUserPanel={setUserPanel}
          orderPanel={orderPanel}
          setOrderPanel={setOrderPanel}
          setActiveView={setActiveView}
        />
      )}
    </main>
  );
}
