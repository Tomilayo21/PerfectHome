"use client";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState, useEffect } from "react";

export default function MiniChart({ range = "week" }) {
  const [chartData, setChartData] = useState([]);
  const [currentRange, setCurrentRange] = useState(range);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/dashboard/stats/chart?range=${currentRange}`);
      const data = await res.json();
      setChartData(data);
    };

    fetchData();
  }, [currentRange]);

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-4">
      {/* Header Toggle */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-gray-800">Deposit Trend</h2>
        <div className="flex gap-2">
          {["week", "month"].map((r) => (
            <button
              key={r}
              onClick={() => setCurrentRange(r)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-200 ${
                currentRange === r
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {r === "week" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>
      </div>

      {/* Line Chart */}
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="name" hide />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                fontSize: "0.75rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
              formatter={(value) => [`₦${Number(value).toLocaleString()}`, "Total"]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#EA580C"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={true}
              animationDuration={600}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
