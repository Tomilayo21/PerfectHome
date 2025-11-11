"use client";

import { toast } from "react-hot-toast";

export default function ExportUserCSV({ users, logActivity }) {
  const exportUsersCSV = () => {
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Username",
      "Signup Method",
      "Role",
      "Created",
      "Updated",
    ];

    const rows = users.map((user) => [
      user.first_name ?? "N/A",
      user.last_name ?? "N/A",
      user.email_addresses[0]?.email_address ?? "N/A",
      user.username ?? "N/A",
      user.external_accounts?.[0]?.provider === "oauth_google" ? "Google" : "Email",
      user.public_metadata?.role ?? "user",
      new Date(user.created_at * 1000).toLocaleString(),
      new Date(user.updated_at * 1000).toLocaleString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "users.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Exported to CSV");
    logActivity?.("Export", "Exported user data to CSV");
  };

  return (
    <button
      onClick={exportUsersCSV}
      className="px-4 py-2 bg-orange border text-black rounded hover:bg-gray-700 hover:text-white"
    >
      Export Users CSV
    </button>
  );
}
