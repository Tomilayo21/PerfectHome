"use client";

export default function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-md p-5 shadow-sm animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="h-[250px] bg-gray-100 dark:bg-gray-800 rounded-md"></div>
    </div>
  );
}
