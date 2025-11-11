"use client";
import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Users,
  DollarSign,
  TrendingUp,
  Rocket,
  FileBarChart,
  CreditCard,
  UserCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  Bell, 
  Plus, 
  ShoppingCart, 
  Box
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import MiniChart from "./settings/charts/MiniChart";
import DashboardChart from "./settings/charts/DashboardChart";
import { motion, AnimatePresence } from "framer-motion";
import AnalyticsDashboard from "./AnalyticsDashboard";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export default function AdminDashboard({
  setActiveView,
  setActiveTab,
  setUserPanel,
  setOrderPanel,
}) {
  const { data: session } = useSession();
  const token = session?.user?.accessToken || session?.user?.token;
  const { currency } = useAppContext();

  const [userCount, setUserCount] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [thisMonthTotal, setThisMonthTotal] = useState(0);
  const [statsData, setStats] = useState([]);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [dailyTrendData, setDailyTrendData] = useState([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState([]);
  const [todayTransactionCount, setTodayTransactionCount] = useState(0);
  const [yesterdayTransactionCount, setYesterdayTransactionCount] = useState(0);
  const [thisMonthTransactionCount, setThisMonthTransactionCount] = useState(0);
  const [showIcons, setShowIcons] = useState(true);
  const [todayDeposit, setTodayDeposit] = useState(0);
  const [yesterdayDeposit, setYesterdayDeposit] = useState(0);
  const [prevMonthTotal, setPrevMonthTotal] = useState(0);
  const [prevMonthCount, setPrevMonthCount] = useState(0);
  const [topProducts, setTopProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allCustomers, setAllCustomers] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0);
  const [viewAll, setViewAll] = useState(false);
  const [viewAllOrders, setViewAllOrders] = useState(false);

  const miniTrendData = [
    { day: "Mon", sales: 30 },
    { day: "Tue", sales: 45 },
    { day: "Wed", sales: 35 },
    { day: "Thu", sales: 50 },
    { day: "Fri", sales: 65 },
    { day: "Sat", sales: 55 },
    { day: "Sun", sales: 70 },
  ];

  const lowStockProducts = [
    { name: "Product A", stock: 3 },
    { name: "Product B", stock: 5 },
    { name: "Product C", stock: 2 },
  ];

  const quickActions = [
    { name: "Add Product", icon: <Plus className="w-5 h-5" /> },
    { name: "Process Order", icon: <ShoppingCart className="w-5 h-5" /> },
    { name: "Update Stock", icon: <Box className="w-5 h-5" /> },
  ];

  const notifications = [
    { message: "New user signed up", time: "2 mins ago" },
    { message: "Order #1024 shipped", time: "1 hour ago" },
    { message: "Low stock alert: Product C", time: "3 hours ago" },
  ];













  // === Customers ===
  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();

        if (data.success) {
          setAllCustomers(data.allCustomers ?? 0);
          setNewCustomers(data.newCustomers ?? 0);
        } else {
          console.error("Failed to fetch counts:", data.error);
        }
      } catch (err) {
        console.error("Error fetching counts:", err);
      }
    };

    fetchUserCounts();
  }, []);

  // === Subscribers ===
  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const res = await fetch("/api/admin/subscribers");
        const data = await res.json();
        if (Array.isArray(data)) {
          setSubscriberCount(data.length);
        }
      } catch (err) {
        console.error("Failed to fetch subscribers", err);
      }
    };
    fetchSubscribers();
  }, []);

  // === Stats ===
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats/growth");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  // === Deposit Stats ===
  useEffect(() => {
    const fetchDepositStats = async () => {
      try {
        const res = await fetch("/api/admin/transactions?page=1&limit=1");
        const data = await res.json();

        setTotalDeposit(data.totalAmount || 0);
        setDailyTotal(data.last24HoursAmount || 0);
        setDailyTrendData(data.dailyTrend || []);
        setMonthlyTrendData(data.monthlyTrend || []);
        setTodayTransactionCount(data.todayCount || 0);
        setYesterdayTransactionCount(data.yesterdayCount || 0);
        setThisMonthTransactionCount(data.thisMonthCount || 0);
        setTodayDeposit(data.todayAmount || 0);
        setYesterdayDeposit(data.yesterdayAmount || 0);
        setPrevMonthTotal(data.prevMonthTotal || 0);
        setPrevMonthCount(data.prevMonthCount || 0);

        // ✅ Sum up all totals for this month
        const monthTotal = Array.isArray(data.monthlyTrend)
          ? data.monthlyTrend.reduce((sum, day) => sum + (day.total || 0), 0)
          : 0;
        setThisMonthTotal(monthTotal);
      } catch (error) {
        console.error("Failed to fetch deposit stats", error);
      }
    };

    fetchDepositStats();
  }, []);

  // === Orders ===
  const fetchAdminOrders = async (limit = 5) => {
    try {
      const { data } = await axios.get(`/api/order/admin-orders?limit=${limit}&page=1`);

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Fetch Orders Error:", error);
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchAdminOrders();
    }
  }, [session?.user]);

  // === Top Products ===
  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const { data } = await axios.get("/api/admin/order/top-products?limit=50");
        if (data.success) {
          setTopProducts(data.topProducts.slice(0, 5));
          setAllProducts(data.topProducts); // ✅ store the full list
        } else {
          toast.error(data.message || "No products found");
        }
      } catch (err) {
        console.error("Error fetching top products:", err);
        toast.error("Failed to load top products");
      }
    };

    fetchTopProducts();
  }, []);

  useEffect(() => {
    console.log("🧾 AdminDashboard Token:", token);
  }, [token]);

  // === Growth % ===
  const projectGrowth =
    prevMonthTotal > 0
      ? (((thisMonthTotal - prevMonthTotal) / prevMonthTotal) * 100).toFixed(1)
      : thisMonthTotal > 0
      ? "100.0"
      : "0.0";

  // === Dashboard Stats ===
  const stats = [
    {
      title: "Total Sales",
      value: `${currency}${totalDeposit.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <DollarSign className="w-6 h-6 text-gray-600 dark:text-white" />,
    },
    {
      title: "Total Orders",
      value: thisMonthTransactionCount.toString(),
      icon: <CreditCard className="w-6 h-6 text-gray-600 dark:text-white" />,
    },
    {
      title: "Total Customers",
      value: allCustomers.toString(),
      icon: <Users className="w-6 h-6 text-gray-600 dark:text-white" />,
    },
    {
      title: "New Customers",
      value: newCustomers.toString(),
      icon: <Users className="w-6 h-6 text-orange-600 dark:text-white" />,
    },
    {
      title: "Conversion",
      value: `${(
        (thisMonthTransactionCount / Math.max(userCount, 1)) *
        100
      ).toFixed(1)}%`,
      icon: <TrendingUp className="w-6 h-6 text-gray-600 dark:text-white" />,
    },
    {
      title: "Avg. Order Value",
      value:
        thisMonthTransactionCount > 0
          ? `${currency}${(thisMonthTotal / thisMonthTransactionCount).toFixed(
              2
            )}`
          : `${currency}0.00`,
      icon: <FileBarChart className="w-6 h-6 text-gray-600 dark:text-white" />,
    },
    {
      title: "Subscribers",
      value: subscriberCount.toString(),
      icon: <UserCheck className="w-6 h-6 text-gray-600 dark:text-white" />,
    },
    {
      title: "Monthly Growth %",
      value: `${projectGrowth}%`,
      icon: <Rocket className="w-6 h-6 text-gray-600 dark:text-white" />,
    },
  ];

  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-black">
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6 dark:bg-black">
        {/* Header */}
        <AdminHeader />

        {/* Icon Toggle */}
        <button
          onClick={() => setShowIcons(!showIcons)}
          className="mb-4 inline-flex items-center gap-2 
          rounded-md border border-gray-300 bg-white px-4 py-2 
          text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 transition
          dark:bg-black dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900
          "
        >
          {showIcons ? (
            <>
              <EyeOff className="w-4 h-4 text-gray-500" />
              <span>Hide Icons</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-gray-500" />
              <span>Show Icons</span>
            </>
          )}
        </button>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 dark:bg-black">
          {stats.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="group relative bg-white dark:bg-black p-6 rounded-md shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300"
            >
              {/* Accent Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-400 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Top Section (Icon) */}
              <div className="flex items-center justify-between mb-4">
                {showIcons && (
                  <div className="flex items-center justify-center w-10 h-10
                    dark:bg-black dark:border-gray-700 dark:text-white dark:hover:bg-gray-900
                    rounded-md bg-orange-50 text-orange-600 border group-hover:bg-orange-100 transition"
                    >
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-sm font-normal text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                {item.title}
              </h3>

              {/* Value */}
              <p className="text-xl font-normal text-gray-900 dark:text-white leading-tight">
                {item.value}
              </p>

              {/* Optional Subtext or Percentage */}
              {item.change && (
                <p
                  className={`mt-2 text-sm font-medium ${
                    item.change > 0
                      ? "text-green-600"
                      : item.change < 0
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {item.change > 0 ? "▲" : item.change < 0 ? "▼" : "•"}{" "}
                  {Math.abs(item.change)}%
                </p>
              )}
            </div>
          ))}
        </div>


        {/* Bottom Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          {stats.slice(3).map((item, idx) => (
            <div
              key={idx}
              className={`group relative bg-white dark:bg-black p-6 rounded-md shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300 ${
                idx === 0 ? "sm:col-span-2" : "sm:col-span-1"
              }`}
            >
              {/* Accent bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-400 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Icon */}
              {showIcons && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-10 h-10
                    dark:bg-black dark:border-gray-700 dark:hover:bg-gray-900 
                    rounded-md bg-orange-50  border text-orange-600 group-hover:bg-orange-100 transition">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                </div>
              )}

              {/* Text */}
              <div className="flex flex-col">
                <h3 className="text-sm font-normal text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  {item.title}
                </h3>
                <p className="text-xl font-normal text-gray-900 dark:text-white leading-tight">
                  {item.value}
                </p>

                {/* Optional subtext or percentage */}
                {item.change && (
                  <p
                    className={`mt-2 text-sm font-medium ${
                      item.change > 0
                        ? "text-green-600"
                        : item.change < 0
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {item.change > 0 ? "▲" : item.change < 0 ? "▼" : "•"}{" "}
                    {Math.abs(item.change)}%
                  </p>
                )}

                {/* Chart (if any) */}
                {item.chart && (
                  <div className="mt-5">
                    <MiniChart data={dailyTrendData} color="#f97316" /> {/* Orange accent */}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Top Products */}
        <div className="space-y-8 mt-8 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* 🧩 Default Top Products View */}
            {!viewAll && (
              <motion.div
                key="top-products-main"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-xl sm:text-3xl font-normal text-gray-900 dark:text-white">
                      Top Products
                    </h1>
                    <p className="text-gray-500 text-sm font-light sm:text-base mt-1 dark:text-white">
                      Track your best-selling items and revenue performance.
                    </p>
                  </div>
                  {topProducts.length > 0 && (
                    <button
                      onClick={() => setViewAll(true)}
                      // className="px-4 py-2 mt-3 sm:mt-0 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition"
                      className="text-sm text-orange-600 hover:text-orange-700 font-normal mt-3 sm:mt-0 transition"
                    >
                      View All
                    </button>
                  )}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {topProducts.length > 0 ? (
                    topProducts.map((p, idx) => (
                      <ProductCard key={idx} p={p} currency={currency} idx={idx} />
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-full text-center py-10">
                      No products found.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* 🧩 Full Product List View */}
            {viewAll && (
              <motion.div
                key="top-products-all"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <button
                  onClick={() => setViewAll(false)}
                  className="flex items-center text-sm text-gray-600 hover:text-black dark:text-white dark:hover:text-gray-200 transition"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>

                <h2 className="text-xl sm:text-2xl font-normal text-gray-900 dark:text-white">
                  All Products
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {allProducts && allProducts.length > 0 ? (
                    allProducts.map((p, idx) => (
                      <ProductCard key={idx} p={p} currency={currency} idx={idx} />
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-full text-center py-10">
                      No products available.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* Recent Orders */}
        <div className="space-y-8 mt-8 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Default Recent Orders View */}
            {!viewAllOrders && (
              <motion.div
                key="recent-orders-main"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-normal text-gray-900 dark:text-white">
                      Recent Orders
                    </h1>
                    <p className="text-gray-500 text-sm font-light sm:text-base mt-1 dark:text-white">
                      Track your latest orders, statuses, and payment progress.
                    </p>
                  </div>

                  {orders.length > 0 && (
                    <button
                      onClick={async () => {
                        await fetchAdminOrders(50); // fetch more
                        setViewAllOrders(true);       // then show all
                      }}
                      className="text-sm text-orange-600 hover:text-orange-700 font-normal mt-3 sm:mt-0 transition"
                    >
                      View All Orders →
                    </button>
                  )}
                </div>

                {/* Orders List */}
                {orders.length > 0 ? (
                  <div className="bg-white border border-gray-100 rounded-md shadow-sm overflow-hidden dark:bg-black dark:border-gray-700">
                    <div className="divide-y divide-gray-100">
                      {orders
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5)
                        .map((order) => (
                          <OrderRow key={order._id} order={order} currency={currency} />
                        ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm dark:text-white">
                    No orders available.
                  </p>
                )}
              </motion.div>
            )}

            {/* Full Orders List View */}
            {viewAllOrders && (
              <motion.div
                key="recent-orders-all"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <button
                  onClick={() => setViewAllOrders(false)}
                  className="flex items-center text-sm text-gray-600 hover:text-black dark:text-white dark:hover:text-gray-200 transition"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>

                <h2 className="text-xl sm:text-2xl font-normal text-gray-900 dark:text-white">
                  All Orders
                </h2>

                {orders.length > 0 ? (
                  <div className="bg-white border border-gray-100 rounded-md shadow-sm overflow-hidden dark:bg-black dark:border-gray-700">
                    <div className="divide-y divide-gray-100">
                      {orders
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map((order) => (
                          <OrderRow key={order._id} order={order} currency={currency} />
                        ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm dark:text-white">
                    No orders available.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* Sales Overview Section (With Button to Analytics) */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Sales Overview</h2>
            <Link
              href="/admin/analytics"
              className="text-sm underline hover:opacity-70 transition"
            >
              View Full Analytics →
            </Link>
          </div>
          

          {/* <SalesOverviewChart /> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Mini Trend Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Weekly Sales Trend</h3>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={miniTrendData}>
                <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Low Stock Alerts</h3>
            <ul>
              {lowStockProducts.map((product, idx) => (
                <li key={idx} className="flex justify-between py-1 border-b last:border-b-0">
                  <span>{product.name}</span>
                  <span className="text-red-500 font-semibold">{product.stock}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Quick Actions</h3>
            <div className="flex flex-col space-y-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-md transition"
                >
                  {action.icon}
                  {action.name}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications Panel */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Bell className="w-5 h-5" /> Notifications
            </h3>
            <ul>
              {notifications.map((note, idx) => (
                <li key={idx} className="py-1 border-b last:border-b-0">
                  <p className="text-sm">{note.message}</p>
                  <p className="text-xs text-gray-400">{note.time}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProductCard({ p, currency, idx }) {
  return (
    <div className="bg-white dark:bg-black p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300">
      {/* Product Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-normal text-gray-900 dark:text-gray-100 truncate">
            {p.product}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Product ID: #{p.id || idx + 1}</p>
        </div>
        <span
          className={`text-xs font-light px-2.5 py-1 rounded-md ${
            p.stock > 20
              ? "bg-green-100 text-black"
              : p.stock > 5
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-black"
          } dark:bg-black border dark:border-gray-700 dark:text-gray-300`}
        >
          {p.stock} left
        </span>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-500">Units Sold</p>
          <p className="text-xl font-normal text-gray-900 dark:text-gray-100">{p.units}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-xl font-normal text-gray-900 dark:text-gray-100">
            {currency}
            {Number(p.revenue).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-orange-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.min((p.units / 100) * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}

function OrderRow({ order, currency }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 dark:hover:bg-gray-900 hover:bg-gray-50 transition">
      {/* Customer Info */}
      <div className="flex items-center gap-3 min-w-[180px]">
        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-medium uppercase">
          {order.address?.fullName
            ? order.address.fullName.charAt(0)
            : "?"}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {order.address?.fullName || order.fullName || "N/A"}
          </p>
          <p className="text-xs font-thin text-gray-500 truncate dark:text-white">
            {order.orderId || "N/A"}
          </p>
        </div>
      </div>

      {/* Amount */}
      <div className="min-w-[100px]">
        <p className="text-sm font-normal text-gray-500 dark:text-white">Amount</p>
        <p className="font-thin text-gray-800 dark:text-white">
          {order.amount
            ? `${currency}${order.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "N/A"}
        </p>
      </div>

      {/* Order Status */}
      <div className="min-w-[120px]">
        <p className="text-sm text-gray-500 dark:text-white">Order</p>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full dark:text-white dark:bg-black border dark:border-gray-700
            ${
              order.orderStatus === "Delivered"
                ? "bg-green-100 text-green-700"
                : order.orderStatus === "Pending"
                ? "bg-orange-100 text-orange-700"
                : order.orderStatus === "Cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              order.orderStatus === "Delivered"
                ? "bg-green-500"
                : order.orderStatus === "Pending"
                ? "bg-orange-500"
                : order.orderStatus === "Cancelled"
                ? "bg-red-500"
                : "bg-gray-400"
            }`}
          ></span>
          {order.orderStatus || "N/A"}
        </span>
      </div>

      {/* Payment Status */}
      <div className="min-w-[130px]">
        <p className="text-sm text-gray-500 dark:text-white">Payment</p>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full dark:text-white dark:bg-black border dark:border-gray-700
            ${
              order.paymentStatus === "Paid"
                ? "bg-green-100 text-green-700"
                : order.paymentStatus === "Pending"
                ? "bg-orange-100 text-orange-700"
                : order.paymentStatus === "Failed"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              order.paymentStatus === "Paid"
                ? "bg-green-500"
                : order.paymentStatus === "Pending"
                ? "bg-orange-500"
                : order.paymentStatus === "Failed"
                ? "bg-red-500"
                : "bg-gray-400"
            }`}
          ></span>
          {order.paymentStatus || "N/A"}
        </span>
      </div>

      {/* Date */}
      <div className="min-w-[120px] text-right">
        <p className="text-sm text-gray-500 dark:text-white">Date</p>
        <p className="font-thin text-gray-800 dark:text-white">
          {new Date(order.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
