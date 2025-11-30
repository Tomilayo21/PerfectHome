"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { RiDownload2Line } from "react-icons/ri";

const COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#60a5fa", "#34d399", "#a78bfa"];

export default function PaymentInsightsChart({ range: defaultRange = "30" }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.role === "admin"; // make sure role is in session

  const [range, setRange] = useState(defaultRange);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const RANGE_LABELS = useMemo(
    () => ({
      "7": "Last 7 Days",
      "30": "Last 30 Days",
      "90": "Last 90 Days",
      all: "All Time",
    }),
    []
  );

  // Redirect non-admin users
  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/");
    }
  }, [status, isAdmin, router]);

  // Fetch payment data
  useEffect(() => {
    if (status !== "authenticated" || !isAdmin) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/admin/payments/insights?range=${range}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch payment data");
        return res.json();
      })
      .then((json) => {
        if (!mounted) return;
        // Map API data to expected keys
        const formatted = (json.data || []).map((d) => ({
          method: d.name,
          count: d.value,
        }));
        setData(formatted);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Failed to load data");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [status, isAdmin, range]);

  const handleExportCSV = () => {
    if (!data || data.length === 0) return;
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
    const filename = `payment_insights_${dateStr}.csv`;
    const header = ["Payment Method", "Count", "Range"];
    const rows = data.map((p) => [p.method, p.count, `"${RANGE_LABELS[range]}"`]);
    const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-md p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Distribution ({RANGE_LABELS[range]})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border px-3 py-1 rounded-md bg-white dark:bg-gray-800 dark:text-gray-200 text-sm"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-900 transition text-sm"
          >
            <RiDownload2Line className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        ) : error ? (
          <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="method"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                onClick={(entry) => console.log("Clicked:", entry.method)}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Count"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
