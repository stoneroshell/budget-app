import type { Expense } from "@/types/database";
import type { Category } from "@/types/database";

/**
 * Sum of expense amounts for a budget. Use this instead of calculating in components.
 */
export function totalSpent(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
}

export type SupercategoryTotals = {
  needs: number;
  wants: number;
  misc: number;
};

/**
 * Sum expense amounts by supercategory. Expenses with null or unknown category_id count as misc.
 */
export function groupExpensesBySupercategory(
  expenses: Expense[],
  categories: Category[]
): SupercategoryTotals {
  const out: SupercategoryTotals = { needs: 0, wants: 0, misc: 0 };
  const byId = new Map(categories.map((c) => [c.id, c]));
  const miscCategory = categories.find((c) => c.name === "Misc");

  for (const e of expenses) {
    const amount = Number(e.amount);
    const catId = e.category_id ?? miscCategory?.id;
    const cat = catId ? byId.get(catId) : null;
    if (!cat) {
      out.misc += amount;
      continue;
    }
    if (cat.supercategory === "needs") out.needs += amount;
    else if (cat.supercategory === "wants") out.wants += amount;
    else out.misc += amount;
  }
  return out;
}

export type CategoryTotal = {
  categoryName: string;
  supercategory: string;
  amount: number;
};

/**
 * Per-category totals for display. Expenses with null category_id are counted under Misc.
 */
export function groupExpensesByCategory(
  expenses: Expense[],
  categories: Category[]
): CategoryTotal[] {
  const miscCategory = categories.find((c) => c.name === "Misc");
  const byCategoryId = new Map<string, number>();
  const categoryMeta = new Map(categories.map((c) => [c.id, { name: c.name, supercategory: c.supercategory }]));

  for (const e of expenses) {
    const key = e.category_id ?? miscCategory?.id ?? "";
    if (!key) continue;
    const prev = byCategoryId.get(key) ?? 0;
    byCategoryId.set(key, prev + Number(e.amount));
  }

  const result: CategoryTotal[] = [];
  for (const [id, amount] of byCategoryId) {
    const meta = categoryMeta.get(id);
    if (meta) result.push({ categoryName: meta.name, supercategory: meta.supercategory, amount });
  }
  result.sort((a, b) => b.amount - a.amount);
  return result;
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export const MONTH_ABBREV = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export function getMonthAbbrev(month: number): string {
  return MONTH_ABBREV[month - 1] ?? "";
}

/** Uppercase 3-letter month code (e.g. JAN, FEB) for display in budget cards. */
export function getMonthAbbrevUpper(month: number): string {
  return (MONTH_ABBREV[month - 1] ?? "").toUpperCase();
}

export function formatMonthYear(month: number, year: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Percentage of income spent (0–100). Returns 0 if income is 0 or negative. */
export function percentOfIncomeSpent(spent: number, income: number): number {
  if (income <= 0) return 0;
  return Math.min(100, (spent / income) * 100);
}

/** Needs and wants as percentage of (needs + wants). Misc excluded. */
export function needsWantsRatio(
  bySuper: SupercategoryTotals
): { needsPercent: number; wantsPercent: number } {
  const total = bySuper.needs + bySuper.wants;
  if (total <= 0)
    return { needsPercent: 0, wantsPercent: 0 };
  return {
    needsPercent: (bySuper.needs / total) * 100,
    wantsPercent: (bySuper.wants / total) * 100,
  };
}

/** At 0 use primary text (white); bold red at minNet, bold green at maxNet (styles.md). */
const NET_GRADIENT_ZERO = "#FFFFFF";
const NET_GRADIENT_RED = "#F43F5E";
const NET_GRADIENT_GREEN = "#10B981";

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function lerpRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

/**
 * Returns a CSS color for net budget amount: white at $0, bold red at the
 * lowest (most negative) net across all months, bold green at the highest net.
 */
export function getNetAmountGradientColor(
  netIncome: number,
  minNet: number,
  maxNet: number
): string {
  const zero = hexToRgb(NET_GRADIENT_ZERO);
  const red = hexToRgb(NET_GRADIENT_RED);
  const green = hexToRgb(NET_GRADIENT_GREEN);

  if (netIncome === 0) return NET_GRADIENT_ZERO;
  if (netIncome < 0) {
    const t = minNet === 0 ? 1 : netIncome / minNet;
    return lerpRgb(zero, red, t);
  }
  const t = maxNet === 0 ? 1 : netIncome / maxNet;
  return lerpRgb(zero, green, t);
}
