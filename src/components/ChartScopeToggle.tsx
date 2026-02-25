"use client";

import { useState } from "react";
import { DonutChartSpending } from "@/components/charts/DonutChartSpending";
import { BarChartNeedsWants } from "@/components/charts/BarChartNeedsWants";
import type { DonutChartSegment } from "@/lib/dashboard-chart-data";
import type { SupercategoryTotals } from "@/lib/helpers";

type Scope = "month" | "all";

type ChartScopeToggleProps = {
  monthDonutData: DonutChartSegment[];
  allTimeDonutData: DonutChartSegment[];
  monthBySuper: SupercategoryTotals;
  allTimeBySuper: SupercategoryTotals;
};

const EMPTY_MONTH = {
  title: "No spending this month",
  donutDesc: "Add expenses to see your breakdown by category.",
  barDesc: "Add expenses to see needs vs wants.",
};
const EMPTY_ALL_TIME = {
  title: "No spending recorded",
  donutDesc: "Add expenses to see your breakdown by category.",
  barDesc: "Add expenses to see needs vs wants.",
};

export function ChartScopeToggle({
  monthDonutData,
  allTimeDonutData,
  monthBySuper,
  allTimeBySuper,
}: ChartScopeToggleProps) {
  const [scope, setScope] = useState<Scope>("month");

  const donutData = scope === "month" ? monthDonutData : allTimeDonutData;
  const bySuper = scope === "month" ? monthBySuper : allTimeBySuper;
  const empty = scope === "month" ? EMPTY_MONTH : EMPTY_ALL_TIME;

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div
          role="group"
          aria-label="Chart time range"
          className="inline-flex rounded-lg border border-charcoal-500 bg-charcoal-900 p-1"
        >
          <button
            type="button"
            onClick={() => setScope("month")}
            aria-pressed={scope === "month"}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              scope === "month"
                ? "bg-accent-violet-500 text-white"
                : "text-charcoal-300 hover:text-charcoal-200"
            }`}
          >
            This month
          </button>
          <button
            type="button"
            onClick={() => setScope("all")}
            aria-pressed={scope === "all"}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              scope === "all"
                ? "bg-accent-violet-500 text-white"
                : "text-charcoal-300 hover:text-charcoal-200"
            }`}
          >
            All time
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-center text-xs font-medium uppercase tracking-widest text-charcoal-400">
            By category
          </h3>
          <DonutChartSpending
            data={donutData}
            emptyTitle={empty.title}
            emptyDescription={empty.donutDesc}
          />
        </div>
        <div>
          <h3 className="mb-2 text-center text-xs font-medium uppercase tracking-widest text-charcoal-400">
            Needs vs Wants
          </h3>
          <BarChartNeedsWants
            needs={bySuper.needs}
            wants={bySuper.wants}
            misc={bySuper.misc}
            emptyTitle={empty.title}
            emptyDescription={empty.barDesc}
          />
        </div>
      </div>
    </div>
  );
}
