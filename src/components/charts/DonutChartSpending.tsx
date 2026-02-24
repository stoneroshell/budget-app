"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export type DonutSegment = {
  name: string;
  value: number;
  color: string;
};

type Props = {
  data: DonutSegment[];
};

export function DonutChartSpending({ data }: Props) {
  if (!data.length || data.every((d) => d.value <= 0)) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-6">
        <p className="text-center text-charcoal-300">No spending this month.</p>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);
  const displayData = data.filter((d) => d.value > 0);

  return (
    <div className="min-h-[280px] w-full rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-4">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={displayData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            stroke="transparent"
          >
            {displayData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) =>
              total > 0
                ? [`$${value.toFixed(2)} (${((value / total) * 100).toFixed(0)}%)`, ""]
                : [value, ""]
            }
            contentStyle={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #2E2E2E",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#A3A3A3" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            formatter={(value) => (
              <span className="text-charcoal-200">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
