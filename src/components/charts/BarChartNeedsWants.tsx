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
import type { TooltipProps } from "recharts";
import { ChartEmptyState } from "@/components/EmptyState";

const NEEDS_COLOR = "#06B6D4";
const LABEL_COLOR = "#A3A3A3";
const VALUE_COLOR = "#8B5CF6";

function NeedsWantsTooltipContent({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const name = item.payload?.name ?? item.name ?? "";
  const value = typeof item.value === "number" ? item.value : 0;
  return (
    <div
      style={{
        backgroundColor: "#1A1A1A",
        border: "1px solid #2E2E2E",
        borderRadius: "8px",
        padding: "8px 12px",
      }}
    >
      <div style={{ color: LABEL_COLOR }}>{name}:</div>
      <div style={{ color: VALUE_COLOR }}>${value.toFixed(2)}</div>
    </div>
  );
}

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
      <div className="min-h-[240px] w-full rounded-xl border border-charcoal-500 bg-charcoal-900/80 p-6">
        <ChartEmptyState
          title="No spending this month"
          description="Add expenses to see needs vs wants."
          className="min-h-[240px]"
        />
      </div>
    );
  }

  return (
    <div className="min-h-[240px] w-full rounded-xl border border-charcoal-500 bg-charcoal-900/80 p-4">
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
            cursor={{ fill: "transparent" }}
            content={<NeedsWantsTooltipContent />}
          />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            stroke="none"
            activeBar={{ stroke: "#A3A3A3", strokeWidth: 1 }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
