"use client";

import { RiCalendarLine } from "react-icons/ri";

export default function AnalyticsFilterBar({ range, setRange }) {
  return (
    <div
      className="sticky top-0 z-10 bg-white dark:bg-black border border-gray-100 
      dark:border-gray-800 rounded-md px-4 py-3 shadow-sm flex flex-wrap items-center justify-between"
    >
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <RiCalendarLine className="text-orange-500" />
        <span className="font-medium">Filter by Date</span>
      </div>

      <select
        value={range}
        onChange={(e) => setRange(e.target.value)}
        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1 text-sm 
        bg-white dark:bg-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <option value="1">Today</option>
        <option value="7">Last 7 Days</option>
        <option value="30">Last 30 Days</option>
        <option value="90">Last 3 Months</option>
      </select>
    </div>
  );
}
