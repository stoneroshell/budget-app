"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type LineChartPoint = {
  monthYear: string;
  spent: number;
};

type Props = {
  data: LineChartPoint[];
};

export function LineChartSpendingOverTime({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-6">
        <p className="text-center text-charcoal-300">
          Add more months to see your spending trend.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[260px] w-full rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-4">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={data}
          margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
          <XAxis
            dataKey="monthYear"
            tick={{ fill: "#A3A3A3", fontSize: 12 }}
            axisLine={{ stroke: "#2E2E2E" }}
            tickLine={{ stroke: "#2E2E2E" }}
          />
          <YAxis
            tick={{ fill: "#A3A3A3", fontSize: 12 }}
            axisLine={{ stroke: "#2E2E2E" }}
            tickLine={{ stroke: "#2E2E2E" }}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Spent"]}
            contentStyle={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #2E2E2E",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#A3A3A3" }}
          />
          <Line
            type="monotone"
            dataKey="spent"
            stroke="#8B5CF6"
            strokeWidth={2}
            dot={{ fill: "#8B5CF6", strokeWidth: 0 }}
            activeDot={{ r: 4, fill: "#A78BFA" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
