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
import { DONUT_GROUP_STROKE } from "@/lib/dashboard-chart-data";

export type DonutSegment = {
  name: string;
  value: number;
  color: string;
  supercategory?: string;
};

type Props = {
  data: DonutSegment[];
  emptyTitle?: string;
  emptyDescription?: string;
};

const INNER_RADIUS = 60;
const OUTER_RADIUS = 90;
/** Gap between main donut and the colored ring */
const RIM_GAP = 10;
/** Ring thickness (sits outside the donut, after RIM_GAP) */
const RIM_WIDTH = 3;

export function DonutChartSpending({
  data,
  emptyTitle = "No spending this month",
  emptyDescription = "Add expenses to see your breakdown by category.",
}: Props) {
  if (!data.length || data.every((d) => d.value <= 0)) {
    return (
      <div className="min-h-[280px] w-full rounded-xl border border-charcoal-500 bg-charcoal-900/80 p-6">
        <ChartEmptyState
          title={emptyTitle}
          description={emptyDescription}
          className="min-h-[280px]"
        />
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);
  const displayData = data.filter((d) => d.value > 0);

  const groups = {
    needs: displayData.filter((d) => d.supercategory === "needs"),
    wants: displayData.filter((d) => d.supercategory === "wants"),
    misc: displayData.filter((d) => d.supercategory === "misc" || !d.supercategory),
  };

  let startAngle = 0;
  const pies = (
    [
      { key: "needs" as const, segments: groups.needs, rimColor: DONUT_GROUP_STROKE.needs },
      { key: "wants" as const, segments: groups.wants, rimColor: DONUT_GROUP_STROKE.wants },
      { key: "misc" as const, segments: groups.misc, rimColor: DONUT_GROUP_STROKE.misc },
    ] as const
  )
    .filter((g) => g.segments.length > 0)
    .map((g) => {
      const groupTotal = g.segments.reduce((s, d) => s + d.value, 0);
      const angleSpan = total > 0 ? (groupTotal / total) * 360 : 0;
      const endAngle = startAngle + angleSpan;
      const result = { ...g, startAngle, endAngle };
      startAngle = endAngle;
      return result;
    });

  return (
    <div className="min-h-[280px] w-full rounded-xl border border-charcoal-500 bg-charcoal-900/80 p-4">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          {/* Main donut: no stroke so no segment borders */}
          {pies.map(({ key, segments, startAngle: start, endAngle: end }) => (
            <Pie
              key={key}
              data={segments}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={INNER_RADIUS}
              outerRadius={OUTER_RADIUS}
              paddingAngle={2}
              stroke="transparent"
              startAngle={start}
              endAngle={end}
            >
              {segments.map((entry, index) => (
                <Cell key={`${key}-${index}`} fill={entry.color} />
              ))}
            </Pie>
          ))}
          {/* Thin colored line around the outside: needs blue / wants amber / misc grey */}
          {pies.map(({ key, rimColor, startAngle: start, endAngle: end }) => (
            <Pie
              key={`rim-${key}`}
              data={[{ value: 1 }]}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={OUTER_RADIUS + RIM_GAP}
              outerRadius={OUTER_RADIUS + RIM_GAP + RIM_WIDTH}
              startAngle={start}
              endAngle={end}
              stroke="none"
              isAnimationActive={false}
              legendType="none"
            >
              <Cell fill={rimColor} />
            </Pie>
          ))}
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
