"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import type { RevenueDataPoint, TopItem } from "@/lib/api/types";

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D4A96A40" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9E8272" }} tickFormatter={(v) => v.slice(5)} />
        <YAxis tick={{ fontSize: 12, fill: "#9E8272" }} />
        <Tooltip
          formatter={(v) => [`₹${v}`, "Revenue"]}
          contentStyle={{
            background: "#FFF8F0",
            border: "1px solid #D4A96A",
            borderRadius: 12,
            color: "#2C1A0E",
          }}
        />
        <Line type="monotone" dataKey="revenue" stroke="#E07B39" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface TopItemsChartProps {
  data: TopItem[];
}

export function TopItemsChart({ data }: TopItemsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#D4A96A40" />
        <XAxis type="number" tick={{ fontSize: 12, fill: "#9E8272" }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#9E8272" }} width={120} />
        <Tooltip
          contentStyle={{
            background: "#FFF8F0",
            border: "1px solid #D4A96A",
            borderRadius: 12,
            color: "#2C1A0E",
          }}
        />
        <Bar dataKey="quantity" fill="#4A7C59" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
