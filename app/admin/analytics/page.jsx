"use client";
import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SalesDashboard from "@/components/admin/settings/charts/DashboardChart";
import { RiDownload2Line, RiFilePdfLine, RiFileExcel2Line, RiCalendarLine } from "react-icons/ri";
import ProductPerformanceChart from "@/components/admin/analytics/ProductPerformanceChart";
import PaymentInsightsChart from "@/components/admin/analytics/PaymentInsightsChart";
import SalesTrendChart from "@/components/admin/analytics/SalesTrendChart";
import ChartSkeleton from "@/components/admin/analytics/ChartSkeleton";


export default function AdminAnalyticsPage() {
    const [dailyTrendData, setDailyTrendData] = useState([]);
    const [monthlyTrendData, setMonthlyTrendData] = useState([]);
    const [range, setRange] = useState("30");
    const [loading, setLoading] = useState(true);


  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, [range]);
    
    return (
        <div className="min-h-screen px-4 md:px-8 py-8 bg-gray-50 dark:bg-gray-900">
        {/* Page Header */}
        {/* <AdminHeader /> */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
                Analytics
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Deep insights on sales, product trends, payment analytics and performance.
            </p>
            </div>
            <Link
            href="/admin"
            className="text-sm underline hover:opacity-80 transition"
            >
            ← Back to Dashboard
            </Link>
        </div>

        {/* Filters & Export */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
            <RiCalendarLine className="text-gray-500" />
            <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2"
            >
                <option value="1">Today</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="custom">Custom Range</option>
            </select>
            </div>

            <div className="flex gap-3">
            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition">
                <RiFileExcel2Line className="text-lg" /> Export CSV
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition">
                <RiFilePdfLine className="text-lg" /> Export PDF
            </button>
            </div>
        </div>

        {/* Optional Filters */}
        <div className="flex gap-3 mb-8">
            {/* <DateRangeFilter /> */}
            {/* <ExportCSVButton /> */}
        </div>

        {/* Sales Overview */}
        <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Sales Overview
            </h2>
            <div className="bg-white dark:bg-black p-6 rounded-md shadow-md border border-gray-100 dark:border-gray-800">
            <AnimatePresence>
                <motion.div
                key="sales-chart"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                <SalesDashboard
                    dailyTrend={dailyTrendData}
                    monthlyTrend={monthlyTrendData}
                />
                </motion.div>
            </AnimatePresence>
            </div>
        </section>

        {/* Analytics Sections */}
        <div className="space-y-12">
            {/* Sales Trends */}
            <section>
            <AnalyticsDashboard />
            </section>

            {/* Product Performance */}
            <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Product Performance
            </h2>
            <ProductPerformanceChart />
            </section>

            {/* Payment Insights */}
            <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Payment Insights
            </h2>
            <PaymentInsightsChart />
            </section>
        </div>

        {/* Floating Quick Export Button */}
        <button
            onClick={() => console.log("Quick Export Triggered...")}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center border bg-white dark:bg-gray-800 hover:opacity-90 transition"
            title="Quick Export"
        >
            <RiDownload2Line className="text-2xl text-gray-800 dark:text-gray-200" />
        </button>
        </div>
    );
}
