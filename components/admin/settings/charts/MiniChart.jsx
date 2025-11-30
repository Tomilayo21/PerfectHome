"use client";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const MiniChart = ({ data, color = "#f97316", dataKey = "count", xKey = "label" }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="w-full h-24 flex items-center justify-center text-sm text-gray-400">No data</div>;
  }

  return (
    <div className="w-full h-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey={xKey} hide />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: `1px solid ${color}`,
              fontSize: "0.75rem",
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, stroke: color, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MiniChart;
