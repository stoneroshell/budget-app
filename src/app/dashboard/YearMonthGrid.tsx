"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MONTH_ABBREV_UPPER, MONTH_NAMES, formatCurrency, getNetAmountGradientColor } from "@/lib/helpers";
import type { BudgetWithNetIncome } from "@/app/actions/budgets";

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

const NET_ZERO_COLOR = "#D5D5D5";

type MonthCellProps = {
  month: number;
  year: number;
  label: string;
  budget: BudgetWithNetIncome | null;
  isSelected: boolean;
  indicatorVariant: "positive" | "negative" | null;
  netIncome: number;
  minNet: number;
  maxNet: number;
};

function MonthCell({
  month,
  year,
  label,
  budget,
  isSelected,
  indicatorVariant,
  netIncome,
  minNet,
  maxNet,
}: MonthCellProps) {
  const monthName = MONTH_NAMES[month - 1] ?? "";
  const ariaLabel = budget
    ? `${monthName} ${year}, budget`
    : `${monthName} ${year}, no budget`;

  const baseClasses =
    "relative flex aspect-square items-center justify-center rounded-xl border bg-charcoal-900 font-sans text-[0.9rem] uppercase tracking-wider transition duration-200 sm:text-[1.05rem]";

  const activeClasses =
    "cursor-pointer border-charcoal-500 text-white hover:border-charcoal-400 hover:scale-[1.02] hover:outline hover:outline-1.2 hover:outline-accent-violet-500 hover:outline-offset-2";
  const disabledClasses =
    "cursor-not-allowed border-charcoal-500 text-charcoal-500";
  const selectedClasses = isSelected ? "ring-2 ring-charcoal-400 ring-inset" : "";

  if (budget) {
    const netColor = getNetAmountGradientColor(netIncome, minNet, maxNet, NET_ZERO_COLOR);
    const formattedNet = `${netIncome >= 0 ? "+" : "-"}${formatCurrency(Math.abs(netIncome))}`;
    return (
      <Link
        href={`/dashboard/${budget.id}`}
        role="gridcell"
        aria-label={ariaLabel}
        aria-selected={isSelected}
        className={`${baseClasses} ${activeClasses} ${selectedClasses}`}
      >
        {indicatorVariant && (
          <span
            className={`absolute top-1.5 right-1.5 h-2 w-2 rounded-full ${
              indicatorVariant === "positive"
                ? "bg-accent-emerald-400"
                : "bg-accent-rose-400"
            }`}
            aria-hidden
          />
        )}
        <div className="flex h-full w-full flex-col">
          <div className="flex flex-1 items-center justify-center">
            <span>{label}</span>
          </div>
          <div
            className="shrink-0 pb-1.5 text-center text-[10px] font-light sm:text-xs"
            style={{ color: netColor }}
          >
            {formattedNet}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <span
      role="gridcell"
      aria-label={ariaLabel}
      aria-disabled="true"
      aria-selected="false"
      className={`${baseClasses} ${disabledClasses}`}
    >
      {label}
    </span>
  );
}

export type YearMonthGridProps = {
  budgets: BudgetWithNetIncome[];
  selectedBudgetId: string | null;
  selectedMonth: number;
  selectedYear: number;
};

export function YearMonthGrid({
  budgets,
  selectedBudgetId,
  selectedMonth,
  selectedYear,
}: YearMonthGridProps) {
  const currentYear = new Date().getFullYear();
  const [viewYear, setViewYear] = useState(selectedYear);

  const minYear =
    budgets.length > 0
      ? Math.min(...budgets.map((b) => b.year), currentYear)
      : currentYear;
  const maxYear =
    budgets.length > 0
      ? Math.max(...budgets.map((b) => b.year), currentYear)
      : currentYear;
  const yearMin = Math.max(MIN_YEAR, minYear);
  const yearMax = Math.min(MAX_YEAR, maxYear);

  useEffect(() => {
    setViewYear(selectedYear);
  }, [selectedYear]);

  const minNet =
    budgets.length > 0 ? Math.min(...budgets.map((b) => b.netIncome)) : 0;
  const maxNet =
    budgets.length > 0 ? Math.max(...budgets.map((b) => b.netIncome)) : 0;

  const cells = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const budget =
      budgets.find((b) => b.month === month && b.year === viewYear) ?? null;
    const isSelected = !!budget && budget.id === selectedBudgetId;
    const netIncome = budget?.netIncome ?? 0;
    const indicatorVariant: "positive" | "negative" | null =
      budget == null
        ? null
        : netIncome > 0
          ? "positive"
          : netIncome < 0
            ? "negative"
            : "positive";

    return {
      month,
      year: viewYear,
      label: MONTH_ABBREV_UPPER[i],
      budget,
      isSelected,
      indicatorVariant,
    };
  });

  return (
    <section aria-label="Select month to view" className="flex w-full flex-col items-center px-2">
      <h2 className="sr-only">View month</h2>

      <div
        className="flex w-full max-w-xl flex-col items-center gap-6 sm:gap-8"
        aria-label="Year"
      >
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setViewYear((y) => Math.max(yearMin, y - 1))}
            disabled={viewYear <= yearMin}
            aria-label="Previous year"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-charcoal-500 bg-charcoal-800 text-charcoal-300 transition-colors duration-200 hover:border-charcoal-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-charcoal-500 disabled:hover:text-charcoal-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span
            className="font-display text-2xl font-light text-white tracking-tight sm:text-3xl"
            aria-hidden
          >
            {viewYear}
          </span>
          <button
            type="button"
            onClick={() => setViewYear((y) => Math.min(yearMax, y + 1))}
            disabled={viewYear >= yearMax}
            aria-label="Next year"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-charcoal-500 bg-charcoal-800 text-charcoal-300 transition-colors duration-200 hover:border-charcoal-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-charcoal-500 disabled:hover:text-charcoal-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <div
          role="grid"
          aria-label="Months"
          className="grid w-full max-w-xl grid-cols-4 gap-3 sm:gap-4"
        >
          {cells.map((cell) => (
            <MonthCell
              key={`${cell.year}-${cell.month}`}
              month={cell.month}
              year={cell.year}
              label={cell.label}
              budget={cell.budget}
              isSelected={cell.isSelected}
              indicatorVariant={cell.indicatorVariant}
              netIncome={cell.budget?.netIncome ?? 0}
              minNet={minNet}
              maxNet={maxNet}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
