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
