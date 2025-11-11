// import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

// const MiniChart = ({ data }) => (
//   <div className="w-full h-20">
//     <ResponsiveContainer width="100%" height="100%">
//       <LineChart data={data}>
//         <Tooltip contentStyle={{ fontSize: "0.75rem" }} />
//         <Line type="monotone" dataKey="total" stroke="#EA580C" strokeWidth={2} dot={false} />
//       </LineChart>
//     </ResponsiveContainer>
//   </div>
// );

// export default MiniChart;





















"use client";
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis, XAxis } from "recharts";

const MiniChart = ({ data, color = "#f97316" }) => {
  return (
    <div className="w-full h-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="day" hide />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #f97316",
              color: "#1f2937",
              fontSize: "0.75rem",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
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
