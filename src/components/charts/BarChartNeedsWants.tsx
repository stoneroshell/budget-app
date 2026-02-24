"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const NEEDS_COLOR = "#06B6D4";
const WANTS_COLOR = "#F59E0B";
const MISC_COLOR = "#737373";

type Props = {
  needs: number;
  wants: number;
  misc?: number;
};

export function BarChartNeedsWants({ needs, wants, misc = 0 }: Props) {
  const hasData = needs > 0 || wants > 0 || misc > 0;
  const data = [
    { name: "Needs", value: needs, color: NEEDS_COLOR },
    { name: "Wants", value: wants, color: WANTS_COLOR },
    ...(misc > 0 ? [{ name: "Misc", value: misc, color: MISC_COLOR }] : []),
  ].filter((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-6">
        <p className="text-center text-charcoal-300">No spending this month.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[240px] w-full rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-4">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
          <XAxis
            dataKey="name"
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
            formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
            contentStyle={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #2E2E2E",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#A3A3A3" }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
