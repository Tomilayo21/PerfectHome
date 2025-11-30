"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import moment from "moment";
import axios from "axios";
import { useAppContext } from "@/context/AppContext";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { RiDownload2Line, RiFilePdfLine, RiFileExcel2Line, RiCalendarLine } from "react-icons/ri";


const FILTERS = [
  { label: "Today", value: "1" },
  { label: "This Week", value: "7" },
  { label: "This Month", value: "30" },
];

export default function SalesDashboard() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken || session?.user?.token;

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    dailyOrders: [],
    dailyRevenue: [],
  });
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState("7");
  const [mode, setMode] = useState("comparison"); // "orders" | "revenue" | "comparison"

  const { currency } = useAppContext();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/order/transactions?range=${range}`);
        if (res.data.success) {
          setStats({
            totalOrders: res.data.totalOrders,
            totalRevenue: res.data.totalRevenue,
            dailyOrders: res.data.dailyOrders,
            dailyRevenue: res.data.dailyRevenue,
          });
        } else {
          toast.error("Failed to load stats");
        }
      } catch (err) {
        console.error("❌ Fetch Stats Error:", err);
        toast.error("Error fetching stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [range]);

  // Merge dailyOrders + dailyRevenue
  const combinedData = stats.dailyOrders.map((o) => {
    const rev = stats.dailyRevenue.find((r) => r.date === o.date);
    return {
      date: o.date,
      label: moment(o.date).format("MMM D"),
      orders: o.count,
      revenue: rev ? rev.total : 0,
    };
  });

  return (
    <div className="mt-4 space-y-8">
      {/* --- Top Cards --- */}
      <div className="grid gap-6 sm:grid-cols-2 dark:bg-black">
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          accent="from-orange-500 to-orange-400"
        />
        <StatCard
          label="Total Revenue"
          value={`${currency}${Number(stats.totalRevenue).toLocaleString()}`}
          accent="from-blue-500 to-blue-400"
        />
      </div>

      {/* --- Filters --- */}
      {/* Desktop Toolbar */}
      <div className="hidden md:flex items-center justify-between mb-6">
        {/* Date Range Dropdown */}
        <div className="flex items-center gap-2">
          <RiCalendarLine className="text-gray-500" />
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="1">Today</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Export Options */}
        <div className="flex gap-3">
          <button
            onClick={() => console.log("Export CSV...")}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <RiFileExcel2Line className="text-lg" />
            Export CSV
          </button>
          <button
            onClick={() => console.log("Export PDF...")}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <RiFilePdfLine className="text-lg" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Mobile Button Filter Group */}
      <div className="flex md:hidden justify-center gap-2 flex-wrap dark:bg-black mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setRange(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                range === f.value
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* --- Chart Section --- */}
      <SalesChart
        combinedData={combinedData}
        stats={stats}
        mode={mode}
        setMode={setMode}
        loading={loading}
        currency={currency}
      />
    </div>
  );
}

/* --- Stat Card --- */
const StatCard = ({ label, value, accent }) => (
  <div className="relative bg-white dark:bg-black p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
    <div
      className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${accent} rounded-t-2xl`}
    ></div>
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
      {label}
    </h3>
    <p className="text-3xl font-normal text-gray-900 dark:text-white mt-2">
      {value}
    </p>
  </div>
);

/* --- Chart --- */
const SalesChart = ({ combinedData, stats, mode, setMode, loading, currency }) => (
  <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 p-6">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
      <div>
        <h3 className="text-lg font-normal text-gray-800 dark:text-gray-100">
          Orders & Revenue Overview
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Visualize performance over your selected date range.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="px-3 py-1 rounded-md text-xs bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
          Orders: {stats.totalOrders}
        </span>
        <span className="px-3 py-1 rounded-md text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Revenue: {currency}
          {Number(stats.totalRevenue).toLocaleString()}
        </span>
      </div>
    </div>

    {/* Chart Toggles */}
    <div className="flex gap-2 mb-4">
      <ChartToggle label="Orders" active={mode === "orders"} onClick={() => setMode("orders")} />
      <ChartToggle label="Revenue" active={mode === "revenue"} onClick={() => setMode("revenue")} />
      <ChartToggle
        label="Comparison"
        active={mode === "comparison"}
        onClick={() => setMode("comparison")}
      />
    </div>

    {/* Chart Body */}
    {loading ? (
      <p className="text-center text-gray-500 mt-10">Loading chart...</p>
    ) : combinedData.length === 0 ? (
      <p className="text-center text-gray-500 mt-10">No data available</p>
    ) : (
      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer>
          <LineChart
            data={combinedData.map((d) => ({
              ...d,
              // 🧮 Scale revenue down only in comparison mode
              scaledRevenue:
                mode === "comparison" ? Number(d.revenue) / 100000 : Number(d.revenue),
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
            <Tooltip
              formatter={(value, name) =>
                name === "scaledRevenue" && mode === "comparison"
                  ? [`${currency}${(value * 10000).toLocaleString()}`, "Revenue"]
                  : [value, name === "orders" ? "Orders" : "Revenue"]
              }
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "12px",
              }}
            />
            <Legend />
            {(mode === "orders" || mode === "comparison") && (
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
                name="Orders"
              />
            )}
            {(mode === "revenue" || mode === "comparison") && (
              <Line
                type="monotone"
                dataKey={mode === "comparison" ? "scaledRevenue" : "revenue"}
                stroke="#464545ff"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
                name="Revenue"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        {mode === "comparison" && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic text-center">
            Revenue values shown in hundreds of thousands for scale
          </p>
        )}
      </div>
    )}
  </div>
);

/* --- Chart Toggle Button --- */
const ChartToggle = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-lg text-sm font-normal transition-all duration-200 ${
      active
        ? "bg-orange-600 dark:bg-black text-white shadow"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    {label}
  </button>
);
