"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Search } from "lucide-react";
import { Loader2, ShieldCheck, UserCog } from "lucide-react";


dayjs.extend(relativeTime);

interface AppUser {
  _id: string;
  name: string;
  email: string;
  username?: string;
  role: "admin" | "user" | "seller";
  imageUrl?: string;
  signupMethod?: "google" | "email";
  createdAt: string;
  updatedAt: string;
}

export default function UserListPanel() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, role: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      const { user: updatedUser } = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: updatedUser.role } : u))
      );
      toast.success("Role updated");
    } catch (err: any) {
      toast.error(err.message || "Error updating role");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted");
    } catch (err: any) {
      toast.error(err.message || "Error deleting user");
    }
  };

  const exportToCSV = () => {
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
      user.name ?? "N/A",
      // user.lastName ?? "N/A",
      user.email ?? "N/A",
      user.username ?? "N/A",
      user.signupMethod === "google" ? "Google" : "Email",
      user.role ?? "user",
      new Date(user.createdAt).toLocaleString(),
      new Date(user.updatedAt).toLocaleString(),
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
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.name}`.toLowerCase();
    const email = user.email?.toLowerCase() ?? "";
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) return <p className="p-4">Loading users...</p>;
  if (error) return <p className="p-4 text-red-600">Error: {error}</p>;

  return (
    <div className="p-4 max-w-6xl flex-1 flex flex-col mx-auto mt-6">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
        <ShieldCheck className="w-5 h-5" /> Manage Users
      </h2>
      {/* Search + Export */}
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-3">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="pl-9 pr-3 py-2 w-full border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-orange-500 outline-none"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <button
          onClick={exportToCSV}
          className="bg-orange-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-black transition-colors shadow-sm"
        >
          Export CSV
        </button>
      </div>

      {/* Table (desktop) */}
      <div className="hidden md:block border rounded-lg shadow-sm bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              {[
                "Photo",
                "Full Name",
                "Email",
                "Username",
                "Role",
                "Created",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-3 py-2 border text-left whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr
                key={user._id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-3 py-2 border">
                  <img
                    src={user.imageUrl || "/user.png"}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </td>
                <td className="px-3 py-2 border">{user.name}</td>
                <td className="px-3 py-2 border text-xs">{user.email}</td>
                <td className="px-3 py-2 border text-xs">
                  {user.username ?? "N/A"}
                </td>
                <td className="px-3 py-2 border">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      updateRole(user._id, e.target.value as "admin" | "user")
                    }
                    className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-3 py-2 border text-xs">
                  {dayjs(user.createdAt).fromNow()}
                </td>
                <td className="px-3 py-2 border text-center">
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-5 mt-6">
        {paginatedUsers.map((user) => (
          <div
            key={user._id}
            className="border rounded-lg p-4 shadow-sm bg-white"
          >
            <div className="flex items-center gap-3 mb-3">
              <img
                src={user.imageUrl || "/user.png"}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">
                  {user.name}
                </p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
            </div>
            <p className="text-xs">
              <span className="font-medium">Username:</span>{" "}
              {user.username ?? "N/A"}
            </p>
            <p className="text-xs">
              <span className="font-medium">Role:</span> {user.role}
            </p>
            <p className="text-xs">
              <span className="font-medium">Created:</span>{" "}
              {dayjs(user.createdAt).fromNow()}
            </p>
            <div className="flex items-center justify-between mt-3">
              <select
                value={user.role}
                onChange={(e) =>
                  updateRole(user._id, e.target.value as "admin" | "user" | "seller")
                }
                className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={() => deleteUser(user._id)}
                className="text-red-600 text-xs underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 mb-12">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === page
                  ? "bg-black text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <Link
          href="/activity-log"
          className="text-orange-600 hover:underline text-sm"
        >
          View Activity Log
        </Link>
      </div>
    </div>
  );
}
