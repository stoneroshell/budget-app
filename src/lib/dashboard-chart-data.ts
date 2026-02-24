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
};

/** Stable palette for category donut: needs, wants, misc + accents. */
const DONUT_PALETTE = [
  "#06B6D4", // needs (cyan)
  "#F59E0B", // wants (amber)
  "#8B5CF6", // violet
  "#10B981", // emerald
  "#3B82F6", // blue
  "#F43F5E", // rose
  "#22D3EE", // cyan 400
  "#FBBF24", // amber 400
  "#A3A3A3", // muted (misc)
] as const;

function getDonutColor(supercategory: string, index: number): string {
  if (supercategory === "needs") return DONUT_PALETTE[0];
  if (supercategory === "wants") return DONUT_PALETTE[1];
  return DONUT_PALETTE[Math.min(2 + index, DONUT_PALETTE.length - 1)];
}

/**
 * Map category totals to Recharts PieChart payload with stable colors.
 */
export function buildDonutChartData(
  categoryTotals: CategoryTotal[]
): DonutChartSegment[] {
  return categoryTotals.map((row, i) => ({
    name: row.categoryName,
    value: row.amount,
    color: getDonutColor(row.supercategory, i),
  }));
}
