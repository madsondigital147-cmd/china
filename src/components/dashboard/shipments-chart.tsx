"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function ShipmentsAreaChart({
  data,
  className,
}: {
  data: Array<{ label: string; count: number }>;
  className?: string;
}) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="shipmentsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#146EF5" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#146EF5" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--foreground)",
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#146EF5"
            strokeWidth={2}
            fill="url(#shipmentsGradient)"
            name="Shipments"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}