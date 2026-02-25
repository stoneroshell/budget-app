import type { SupercategoryTotals } from "@/lib/helpers";
import type { CategoryTotal } from "@/lib/helpers";
import { formatCurrency } from "@/lib/helpers";

/** Calendar-previous month (Jan → Dec of prior year). */
export function getPreviousMonth(
  month: number,
  year: number
): { month: number; year: number } {
  if (month <= 1) return { month: 12, year: year - 1 };
  return { month: month - 1, year };
}

export type MonthSnapshot = {
  income: number;
  spent: number;
  bySuper: SupercategoryTotals;
  byCategory: CategoryTotal[];
  month?: number;
  year?: number;
};

export type Insight = {
  text: string;
  type?: "info" | "highlight";
};

const MAX_CATEGORY_COMPARISONS = 5;

/**
 * Generate month-over-month insights. Returns empty array when previous is null
 * (caller should show "Add another month…" empty state).
 */
export function generateMonthlyInsights(
  current: MonthSnapshot,
  previous: MonthSnapshot | null
): Insight[] {
  if (previous === null) return [];

  const insights: Insight[] = [];

  // Total spent vs last month
  if (previous.spent > 0) {
    const pctChange =
      ((current.spent - previous.spent) / previous.spent) * 100;
    if (Math.abs(pctChange) < 1) {
      insights.push({
        text: "You spent about the same as last month.",
        type: "info",
      });
    } else if (pctChange > 0) {
      insights.push({
        text: `You spent ${Math.round(pctChange)}% more than last month.`,
        type: "highlight",
      });
    } else {
      insights.push({
        text: `You spent ${Math.round(-pctChange)}% less than last month.`,
        type: "highlight",
      });
    }
  } else if (current.spent > 0) {
    insights.push({
      text: "You had spending this month (last month had none).",
      type: "info",
    });
  }

  // Largest expense category
  if (current.byCategory.length > 0) {
    const largest = current.byCategory[0];
    insights.push({
      text: `Your largest expense category was ${largest.categoryName}.`,
      type: "info",
    });
  }

  // Per-category comparison (top N categories that exist in both months)
  const prevByCategoryName = new Map(
    previous.byCategory.map((c) => [c.categoryName, c.amount])
  );
  const topCurrent = current.byCategory.slice(0, MAX_CATEGORY_COMPARISONS);
  for (const row of topCurrent) {
    const prevAmount = prevByCategoryName.get(row.categoryName);
    if (prevAmount == null || prevAmount <= 0) continue;
    if (row.amount <= 0) continue;
    const pctChange = ((row.amount - prevAmount) / prevAmount) * 100;
    if (Math.abs(pctChange) < 1) continue;
    const direction = pctChange > 0 ? "more" : "less";
    insights.push({
      text: `You spent ${Math.round(Math.abs(pctChange))}% ${direction} on ${row.categoryName} than last month.`,
      type: "info",
    });
  }

  // Dollar amount for top 1–2 categories (not Misc)
  const notable = current.byCategory.filter(
    (c) => c.categoryName !== "Misc" && c.amount > 0
  );
  for (const row of notable.slice(0, 2)) {
    insights.push({
      text: `You spent ${formatCurrency(row.amount)} on ${row.categoryName} this month.`,
      type: "info",
    });
  }

  return insights;
}
