"use client";
import React from "react";

const SubscriberExportButton = () => {
  const exportToCSV = async () => {
    try {
      const res = await fetch("/api/admin/subscribers");
      if (!res.ok) throw new Error("Failed to fetch subscribers");
      const data = await res.json();

      const headers = ["Email", "Subscribed At"];
      const rows = data.subscribers.map((sub) => [
        sub.email,
        new Date(sub.subscribedAt).toLocaleString(),
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers, ...rows].map((e) => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "subscribers.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("CSV Export Error:", error);
      alert("Failed to export subscribers. Try again.");
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={exportToCSV}
        className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-black transition"
      >
        Export to CSV
      </button>
    </div>
  );
};

export default SubscriberExportButton;
