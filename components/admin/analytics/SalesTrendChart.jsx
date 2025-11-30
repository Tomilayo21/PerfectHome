"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function SalesTrendChart({ range }) {
  const data = Array.from({ length: 10 }, (_, i) => ({
    day: `Day ${i + 1}`,
    sales: Math.floor(Math.random() * 1000 + 200),
  }));

  return (
    <div className="bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-md p-5 shadow-sm">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="day" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip />
          <Line type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">
        Showing data for last {range} days
      </p>
    </div>
  );
}
