"use client";
import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Users, Home, Eye, EyeOff, MapPin, Star, Plus } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import MiniChart from "./settings/charts/MiniChart";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import AnalyticsDashboard from "./AnalyticsDashboard";

export default function AdminDashboard() {
  const { currency } = useAppContext();
  const [showIcons, setShowIcons] = useState(true);

  // property summary
  const [totalProperties, setTotalProperties] = useState(0);
  const [newListingsThisMonth, setNewListingsThisMonth] = useState(0);
  const [featuredProperties, setFeaturedProperties] = useState(0);
  const [activeLocations, setActiveLocations] = useState(0);

  // analytics
  const [totalPageViews, setTotalPageViews] = useState(0);
  const [dailyViews, setDailyViews] = useState([]); // page_view daily totals
  const [dailyPropertyViews, setDailyPropertyViews] = useState([]); // property_view daily totals
  const [weeklyTraffic, setWeeklyTraffic] = useState([]); // last 7 days of dailyViews
  const [topLocations, setTopLocations] = useState([]); // { _id, views }
  const [topViewedProperties, setTopViewedProperties] = useState([]); // { property, views }
  const [topEngagedProperties, setTopEngagedProperties] = useState([]); // { property, clicks }
  const [monthlyListingActivity, setMonthlyListingActivity] = useState([]); // { name, count }

  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    // fetch properties for summary counts
    const fetchProperties = async () => {
      try {
        const res = await fetch("/api/property/list");
        const data = await res.json();
        if (!res.ok) {
          console.error("Failed to fetch properties", data);
          return;
        }

        // total properties
        setTotalProperties(Array.isArray(data) ? data.length : data.total || 0);

        // new listings this month
        const now = new Date();
        const items = Array.isArray(data) ? data : data.properties || [];
        const newThisMonth = items.filter((p) => {
          const created = new Date(p.createdAt);
          return (
            created.getMonth() === now.getMonth() &&
            created.getFullYear() === now.getFullYear()
          );
        });
        setNewListingsThisMonth(newThisMonth.length);

        // featured properties (expects boolean isFeatured)
        setFeaturedProperties(items.filter((p) => p.isFeatured).length);

        // active locations (unique city/state)
        const locations = new Set(items.map((p) => (p.city || p.state || "").trim()).filter(Boolean));
        setActiveLocations(locations.size);
      } catch (err) {
        console.error("Properties fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    // fetch analytics summary (30 days by default)
    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const res = await fetch("/api/analytics?range=30");
        const data = await res.json();
        if (!res.ok) return console.error("Failed analytics", data);

        setTotalPageViews(data.totalPageViews ?? 0);
        setDailyViews(data.dailyViews ?? []);
        setDailyPropertyViews(data.dailyPropertyViews ?? []);
        setWeeklyTraffic(data.weeklyTraffic ?? []);
        setTopLocations(data.topLocations ?? []);
        setTopViewedProperties(data.topViewedProperties ?? []);
        setTopEngagedProperties(data.topEngagedProperties ?? []);
        setMonthlyListingActivity(data.monthlyListingActivity ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchProperties();
    fetchAnalytics();
  }, []);

  const stats = [
    { title: "Total Properties", value: totalProperties, icon: <Home className="w-6 h-6 text-gray-600" /> },
    { title: "New Listings This Month", value: newListingsThisMonth, icon: <Plus className="w-6 h-6 text-gray-600" /> },
    { title: "Total Page Views", value: totalPageViews, icon: <Eye className="w-6 h-6 text-gray-600" /> },
    { title: "Featured Properties", value: featuredProperties, icon: <Star className="w-6 h-6 text-gray-600" /> },
    { title: "Active Locations", value: activeLocations, icon: <MapPin className="w-6 h-6 text-gray-600" /> },
  ];

  // Helper renderers for small lists
  const renderTopLocations = () => {
    if (!topLocations.length)
      return (
        <p className="text-sm text-gray-500 text-center">
          No location data.
        </p>
      );

    return (
      <ul className="space-y-2">
        {topLocations.map((loc, i) => {
          const locationName = loc._id || loc.location || "Unknown";
          const count = loc.views ?? loc.count ?? 0;

          return (
            <li
              key={i}
              className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <span className="text-sm text-gray-900 dark:text-white truncate">
                {locationName}
              </span>
              <span className="text-sm font-medium text-blue-600">{count}</span>
            </li>
          );
        })}
      </ul>
    );
  };


  const renderTopViewedProperties = () => {
    if (!topViewedProperties.length)
      return (
        <p className="text-sm text-gray-500 text-center">
          No property view data.
        </p>
      );

    return (
      <ul className="space-y-3">
        {topViewedProperties.map((p, i) => {
          const title =
            p.property?.title?.trim() ||
            p.property?.name?.trim() ||
            `Property ${p.propertyId}`;
          const location =
            [p.property?.city, p.property?.state].filter(Boolean).join(", ") ||
            "—";
          const views = p.views ?? 0;

          return (
            <li
              key={i}
              className="flex justify-between items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {title}
                </div>
                <div className="text-xs text-gray-500 truncate">{location}</div>
              </div>
              <div className="flex-shrink-0 text-sm font-semibold text-blue-600">
                {views}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  const renderTopEngagedProperties = () => {
    if (!topEngagedProperties.length)
      return (
        <p className="text-sm text-gray-500 text-center">
          No engagement data.
        </p>
      );

    return (
      <ul className="space-y-3">
        {topEngagedProperties.map((p, i) => {
          const title =
            p.property?.title ||
            p.property?.name ||
            (p._id ? `Property ${p._id}` : "Unknown");
          const location =
            [p.property?.city, p.property?.state].filter(Boolean).join(", ") ||
            "—";
          const clicks = p.clicks ?? p.count ?? 0;

          return (
            <li
              key={i}
              className="flex justify-between items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {title}
                </div>
                <div className="text-xs text-gray-500 truncate">{location}</div>
              </div>
              <div className="flex-shrink-0 text-sm font-semibold text-blue-600">
                {clicks}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };


  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50 dark:bg-black">
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6 dark:bg-black">
        {/* Header */}
        <AdminHeader />

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Overview of Listings & Engagement</p>
        </div>

        {/* Icon Toggle */}
        <button
          onClick={() => setShowIcons(!showIcons)}
          className="mb-4 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 transition dark:bg-black dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
        >
          {showIcons ? <><EyeOff className="w-4 h-4 text-gray-500" /> <span>Hide Icons</span></> : <><Eye className="w-4 h-4 text-gray-500" /> <span>Show Icons</span></>}
        </button>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {stats.map((item, idx) => (
            <div key={idx} className="group relative bg-white dark:bg-black p-4 sm:p-6 rounded-md shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300">
              {showIcons && <div className="flex items-center justify-center w-10 h-10 mb-2 sm:mb-4 rounded-md bg-blue-50 text-blue-600">{item.icon}</div>}
              <h3 className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{item.title}</h3>
              <p className="text-lg sm:text-xl font-normal text-gray-900 dark:text-white">{loading ? "—" : item.value}</p>
            </div>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="mt-6 sm:mt-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4">Analytics</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Property Views Overview */}
            <div className="bg-black border border-white p-4 sm:p-6 rounded-md shadow-sm w-full overflow-x-auto">
              <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Property Views Overview</h3>
              {analyticsLoading ? (
                <div className="h-36 flex items-center justify-center text-sm text-gray-500">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={dailyPropertyViews.length ? dailyPropertyViews : dailyViews}>
                    <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 12 }} interval={Math.floor((dailyPropertyViews.length || dailyViews.length) / 7)} />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [value, "Views"]}
                      labelFormatter={(label, payload) => `Date: ${payload?.[0]?.payload?.date}`}
                      contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #f97316", fontSize: "0.75rem" }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Weekly Traffic Insights */}
            <div className="bg-black border border-white p-4 sm:p-6 rounded-md shadow-sm w-full overflow-x-auto">
              <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Weekly Traffic Insights</h3>
              {analyticsLoading ? <div className="h-36 flex items-center justify-center text-sm text-gray-500">Loading...</div> : <MiniChart data={weeklyTraffic} color="#f97316" />}
            </div>

            {/* Top Viewed Locations */}
            <div className="bg-black border border-white p-4 sm:p-6 rounded-md shadow-sm w-full overflow-x-auto">
              <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Top Viewed Locations</h3>
              {analyticsLoading ? <p className="text-sm text-gray-500">Loading...</p> : renderTopLocations()}
            </div>

            {/* Most Engaged Properties */}
            <div className="bg-black border border-white p-4 sm:p-6 rounded-md shadow-sm w-full overflow-x-auto">
              <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Most Engaged Properties</h3>
              {analyticsLoading ? <p className="text-sm text-gray-500">Loading...</p> : renderTopEngagedProperties()}
            </div>

            {/* Top Viewed Properties */}
            <div className="bg-black border border-white p-4 sm:p-6 rounded-md shadow-sm w-full overflow-x-auto sm:col-span-2">
              <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Top Viewed Properties</h3>
              {analyticsLoading ? <p className="text-sm text-gray-500">Loading...</p> : renderTopViewedProperties()}
            </div>
          </div>
        </div>

        <AnalyticsDashboard />
      </main>
    </div>

  );
}
