"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { ChartEmptyState } from "@/components/EmptyState";

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
      <div className="min-h-[280px] w-full rounded-xl border border-charcoal-500 bg-charcoal-900/80 p-6">
        <ChartEmptyState
          title="No spending this month"
          description="Add expenses to see your breakdown by category."
          className="min-h-[280px]"
        />
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);
  const displayData = data.filter((d) => d.value > 0);

  return (
    <div className="min-h-[280px] w-full rounded-xl border border-charcoal-500 bg-charcoal-900/80 p-4">
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
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const segment = payload[0].payload as DonutSegment;
              const segmentColor = segment.color ?? "#A3A3A3";
              const value = Number(segment.value);
              const pct =
                total > 0 ? ((value / total) * 100).toFixed(0) : "0";
              return (
                <div
                  className="rounded-lg border border-charcoal-500 bg-charcoal-900 px-3 py-2 shadow-lg"
                  style={{
                    borderColor: "#2E2E2E",
                  }}
                >
                  <div
                    className="text-sm font-medium"
                    style={{ color: segmentColor }}
                  >
                    {segment.name}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: segmentColor }}
                  >
                    ${value.toFixed(2)} ({pct}%)
                  </div>
                </div>
              );
            }}
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
