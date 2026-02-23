import type { Expense } from "@/types/database";

/**
 * Sum of expense amounts for a budget. Use this instead of calculating in components.
 */
export function totalSpent(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
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
