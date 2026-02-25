import type { BudgetWithNetIncome } from "@/app/actions/budgets";
import type { CategoryTotal } from "@/lib/helpers";
import { getMonthAbbrev } from "@/lib/helpers";

/** One point for the line chart: month label and total spent. */
export type LineChartPoint = {
  monthYear: string;
  spent: number;
};

/**
 * Build chronological spending-by-month series from budgets.
 * Uses income - netIncome for total spent per budget.
 */
export function buildLineChartData(
  budgets: BudgetWithNetIncome[]
): LineChartPoint[] {
  const withSpent = budgets.map((b) => ({
    year: b.year,
    month: b.month,
    spent: Number(b.income) - b.netIncome,
  }));
  withSpent.sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
  return withSpent.map(({ year, month, spent }) => ({
    monthYear: `${getMonthAbbrev(month)} ${year}`,
    spent,
  }));
}

/** One segment for the donut chart. */
export type DonutChartSegment = {
  name: string;
  value: number;
  color: string;
  supercategory: string;
};

/**
 * Donut palette: chart colors for needs/wants segments only. Slate is reserved for misc.
 * Each non-misc category gets a unique color by index (styles.md).
 */
const DONUT_PALETTE = [
  "#D946EF", // Fuchsia (charts)
  "#6366F1", // Indigo (charts)
  "#14B8A6", // Teal (charts)
  "#F97316", // Orange (charts)
  "#84CC16", // Lime (charts)
  "#EC4899", // Pink (charts)
  "#8B5CF6", // Violet (accent)
  "#06B6D4", // Cyan (accent)
  "#F59E0B", // Amber (accent)
  "#F43F5E", // Rose (accent)
  "#10B981", // Emerald (accent)
  "#3B82F6", // Blue (accent)
];

/** Slate: reserved for misc category segments only (styles.md charts). */
const DONUT_MISC_COLOR = "#64748B";

const SUPERORDER: Record<string, number> = {
  needs: 0,
  wants: 1,
  misc: 2,
};

/**
 * Map category totals to donut segments. Sorted by supercategory (needs, wants, misc)
 * then by amount desc so groups are contiguous for outline styling.
 * Needs/wants get palette colors; misc always gets slate.
 */
export function buildDonutChartData(
  categoryTotals: CategoryTotal[]
): DonutChartSegment[] {
  const sorted = [...categoryTotals].sort((a, b) => {
    const orderA = SUPERORDER[a.supercategory] ?? 2;
    const orderB = SUPERORDER[b.supercategory] ?? 2;
    if (orderA !== orderB) return orderA - orderB;
    return b.amount - a.amount;
  });
  let paletteIndex = 0;
  return sorted.map((row) => {
    const color =
      row.supercategory === "misc"
        ? DONUT_MISC_COLOR
        : DONUT_PALETTE[paletteIndex++ % DONUT_PALETTE.length];
    return {
      name: row.categoryName,
      value: row.amount,
      color,
      supercategory: row.supercategory,
    };
  });
}

/** Outline colors for needs/wants/misc groups (styles.md). Misc uses slate. */
export const DONUT_GROUP_STROKE = {
  needs: "#06B6D4",
  wants: "#F59E0B",
  misc: DONUT_MISC_COLOR,
} as const;
