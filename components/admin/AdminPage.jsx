"use client";
import { useState } from "react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminSettings from "@/components/admin/AdminSettings";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [userPanel, setUserPanel] = useState("main");
  const [orderPanel, setOrderPanel] = useState(null);

  return (
    <>
      <AdminDashboard
        setActiveTab={setActiveTab}
        setUserPanel={setUserPanel}
        setOrderPanel={setOrderPanel}
      />

      <AdminSettings
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userPanel={userPanel}
        setUserPanel={setUserPanel}
        orderPanel={orderPanel}
        setOrderPanel={setOrderPanel}
      />
    </>
  );
}
