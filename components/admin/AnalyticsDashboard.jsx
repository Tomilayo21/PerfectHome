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
import { RiDownload2Line, RiFilePdfLine, RiFileExcel2Line, RiCalendarLine } from "react-icons/ri";


const FILTERS = [
  { label: "Today", value: "1" },
  { label: "Last 7 Days", value: "7" },
  { label: "Last 30 Days", value: "30" },
];

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalPageViews: 0,
    totalClicks: 0,
    topPages: [],
    dailyViews: [],
    dailyClicks: [],
    dailyVisitors: [],
  });
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7");
  const [mode, setMode] = useState("comparison");
  const [showMore, setShowMore] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?range=${range}`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [range]);

  const combinedData = stats.dailyViews.map((v) => {
    const clicksForDate =
      stats.dailyClicks.find((c) => c.date === v.date)?.count || 0;
    const visitorsForDate =
      stats.dailyVisitors.find((u) => u.date === v.date)?.count || 0;
    return {
      date: v.date,
      label: v.label,
      views: v.count,
      clicks: clicksForDate,
      visitors: visitorsForDate,
    };
  });

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Analytics Overview
        </h1>
      </div>

      <div className="mt-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Top Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            label="Total Visitors"
            value={stats.totalVisitors}
            accent="from-blue-500 to-blue-400"
          />
          <StatCard
            label="Total Page Views"
            value={stats.totalPageViews}
            accent="from-orange-500 to-orange-400"
          />
          <StatCard
            label="Total Clicks"
            value={stats.totalClicks}
            accent="from-emerald-500 to-emerald-400"
          />
        </div>

        {/* Toggle button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowMore(!showMore)}
            className="px-5 py-2 text-sm font-medium text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 transition-all"
          >
            {showMore ? "Show Less" : "Show More"}
          </button>
        </div>

        {showMore && (
          <div className="space-y-8">
            {/* Filter Buttons */}
            <div className="flex md:hidden justify-center gap-2 flex-wrap dark:bg-black mb-4">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setRange(f.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    range === f.value
                      ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

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

            {/* Chart Section */}
            <EngagementChart
              combinedData={combinedData}
              stats={stats}
              mode={mode}
              setMode={setMode}
              loading={loading}
            />

            {/* Top Pages Table */}
            <TopPages topPages={stats.topPages} />
          </div>
        )}
      </div>
    </div>
  );
}

/* --- Stat Card --- */
const StatCard = ({ label, value, accent }) => (
  <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all duration-300">
    <div
      className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${accent} rounded-t-2xl`}
    ></div>
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
      {label}
    </h3>
    <p className="text-3xl font-normal text-gray-900 dark:text-white mt-2">
      {value.toLocaleString()}
    </p>
  </div>
);

/* --- Engagement Chart --- */
const EngagementChart = ({ combinedData, stats, mode, setMode, loading }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
      <div>
        <h3 className="text-lg font-normal text-gray-900 dark:text-gray-100">
          Engagement Trend
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Track key engagement metrics across the selected date range.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge className="rounded-md" color="orange" label={`Views: ${stats.totalPageViews}`} />
        <Badge color="blue" label={`Visitors: ${stats.totalVisitors}`} />
        <Badge color="emerald" label={`Clicks: ${stats.totalClicks}`} />
      </div>
    </div>

    {/* Chart Mode Buttons */}
    <div className="flex gap-2 mb-4">
      {["views", "clicks", "visitors", "comparison"].map((type) => (
        <ChartToggle
          key={type}
          label={type[0].toUpperCase() + type.slice(1)}
          active={mode === type}
          onClick={() => setMode(type)}
        />
      ))}
    </div>

    {/* Chart */}
    {loading ? (
      <p className="text-center text-gray-500 mt-10">Loading chart...</p>
    ) : (
      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer>
          <LineChart data={combinedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#6b7280" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#6b7280" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend />
            {(mode === "views" || mode === "comparison") && (
              <Line
                type="monotone"
                dataKey="views"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            )}
            {(mode === "clicks" || mode === "comparison") && (
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            )}
            {(mode === "visitors" || mode === "comparison") && (
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

/* --- Top Pages Table --- */
const TopPages = ({ topPages }) => {
  const top3 = topPages.slice(0, 3);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 overflow-x-auto">
      <h3 className="text-lg font-normal text-gray-900 dark:text-gray-100 mb-1">
        Top Pages
      </h3>
      <p className="text-sm font-thin text-gray-700 dark:text-gray-400 mb-4">
        Most visited pages ranked by total views.
      </p>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Page
            </th>
            <th className="py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Views
            </th>
          </tr>
        </thead>
        <tbody>
          {top3.length > 0 ? (
            top3.map((page, idx) => {
              const displayName =
                page._id === "/"
                  ? "Home"
                  : page._id
                      .replace(/^\//, "")
                      .split("-")
                      .map((w) => w[0].toUpperCase() + w.slice(1))
                      .join(" ");
              return (
                <tr
                  key={idx}
                  className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all`}
                >
                  <td className="py-2 text-gray-800 dark:text-gray-300">{displayName}</td>
                  <td className="py-2 font-normal text-gray-900 dark:text-white">{page.views}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan="2"
                className="py-3 text-center text-gray-500 dark:text-gray-400 italic"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

/* --- Reusable Components --- */
const ChartToggle = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
    }`}
  >
    {label}
  </button>
);

const Badge = ({ color, label }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs bg-${color}-100 text-${color}-700`}
  >
    {label}
  </span>
);
