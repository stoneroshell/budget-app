"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { formatMonthYear, MONTH_ABBREV } from "@/lib/helpers";
import type { BudgetWithNetIncome } from "@/app/actions/budgets";

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

type ViewMonthSelectorProps = {
  budgets: BudgetWithNetIncome[];
  selectedBudgetId: string | null;
  selectedMonth: number;
  selectedYear: number;
};

export function ViewMonthSelector({
  budgets,
  selectedBudgetId,
  selectedMonth,
  selectedYear,
}: ViewMonthSelectorProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selectedYear);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const minYear =
    budgets.length > 0
      ? Math.min(...budgets.map((b) => b.year), new Date().getFullYear())
      : new Date().getFullYear();
  const maxYear =
    budgets.length > 0
      ? Math.max(...budgets.map((b) => b.year), new Date().getFullYear())
      : new Date().getFullYear();
  const yearMin = Math.max(MIN_YEAR, minYear);
  const yearMax = Math.min(MAX_YEAR, maxYear);

  // When opening, sync viewYear to selected budget's year
  useEffect(() => {
    if (open) {
      setViewYear(selectedYear);
    }
  }, [open, selectedYear]);

  // Click outside and Escape to close
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const triggerLabel =
    selectedBudgetId && selectedMonth >= 1 && selectedMonth <= 12
      ? formatMonthYear(selectedMonth, selectedYear)
      : "Select month";

  return (
    <div ref={wrapperRef} className="relative flex justify-center">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select month and year"
        className="rounded-lg bg-accent-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-accent-violet-400 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-950"
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select month and year"
          className="absolute top-full z-10 mt-2 w-64 rounded-xl border border-charcoal-500 bg-charcoal-900 p-4 shadow-lg"
        >
          {/* Year row */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-lg font-medium text-accent-violet-400">
              {viewYear}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setViewYear((y) => Math.max(yearMin, y - 1))}
                disabled={viewYear <= yearMin}
                aria-label="Previous year"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-charcoal-500 bg-charcoal-800 text-charcoal-300 transition-colors hover:border-charcoal-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900 disabled:opacity-50 disabled:hover:border-charcoal-500 disabled:hover:text-charcoal-300"
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
              <button
                type="button"
                onClick={() => setViewYear((y) => Math.min(yearMax, y + 1))}
                disabled={viewYear >= yearMax}
                aria-label="Next year"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-charcoal-500 bg-charcoal-800 text-charcoal-300 transition-colors hover:border-charcoal-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900 disabled:opacity-50 disabled:hover:border-charcoal-500 disabled:hover:text-charcoal-300"
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
          </div>

          {/* Month grid: 3 columns x 4 rows */}
          <div className="grid grid-cols-3 gap-2">
            {MONTH_ABBREV.map((label, index) => {
              const month = index + 1;
              const budgetForMonth = budgets.find(
                (b) => b.month === month && b.year === viewYear
              );
              const isSelected =
                !!budgetForMonth && budgetForMonth.id === selectedBudgetId;

              if (budgetForMonth) {
                return (
                  <Link
                    key={month}
                    href={`/dashboard?budget=${budgetForMonth.id}`}
                    onClick={() => setOpen(false)}
                    role="option"
                    aria-selected={isSelected}
                    className={`rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900 ${
                      isSelected
                        ? "bg-accent-violet-500 text-white"
                        : "text-charcoal-200 hover:bg-charcoal-700"
                    }`}
                  >
                    {label}
                  </Link>
                );
              }

              return (
                <span
                  key={month}
                  role="option"
                  aria-disabled="true"
                  aria-selected="false"
                  title="No budget"
                  className="cursor-default rounded-lg px-3 py-2 text-center text-sm text-charcoal-500"
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
