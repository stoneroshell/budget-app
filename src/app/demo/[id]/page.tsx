"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useDemo } from "@/contexts/DemoContext";
import {
  totalSpent,
  formatMonthYear,
  formatCurrency,
  groupExpensesBySupercategory,
  groupExpensesByCategory,
} from "@/lib/helpers";
import { buildDonutChartData } from "@/lib/dashboard-chart-data";
import { DonutChartSpending } from "@/components/charts/DonutChartSpending";
import { DemoEditableIncome } from "../DemoEditableIncome";
import { DemoAddExpenseForm } from "../DemoAddExpenseForm";
import { DemoExpenseList } from "../DemoExpenseList";
import { DemoDeleteBudgetButton } from "../DemoDeleteBudgetButton";
import { EmptyState } from "@/components/EmptyState";

export default function DemoBudgetDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const demo = useDemo();

  const budget = useMemo(() => (id ? demo.getBudgetById(id) : null), [demo, id]);
  const expenses = useMemo(
    () => (id ? demo.getExpensesByBudgetId(id) : []),
    [demo, id]
  );
  const categories = useMemo(() => demo.getCategories(), [demo]);
  const budgetsList = useMemo(() => demo.getBudgetsWithNetIncome(), [demo]);

  if (!demo.isHydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-charcoal-400">Loading demo…</p>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="space-y-6">
        <Link
          href="/demo"
          className="btn-secondary inline-block"
          aria-label="Back to demo dashboard"
        >
          ← Back to demo
        </Link>
        <div className="rounded-xl border border-charcoal-500 bg-charcoal-900/80 p-8">
          <EmptyState
            title="Budget not found"
            description="This budget may have been deleted or the link is invalid. Go back to the demo dashboard."
          />
        </div>
      </div>
    );
  }

  const spent = totalSpent(expenses);
  const remaining = Number(budget.income) - spent;
  const bySuper = groupExpensesBySupercategory(expenses, categories);
  const byCategory = groupExpensesByCategory(expenses, categories);
  const donutData = buildDonutChartData(byCategory);

  return (
    <div className="space-y-6">
      <div className="relative flex items-center justify-center py-1">
        <Link
          href="/demo"
          className="btn-secondary absolute left-0 shrink-0"
          aria-label="Back to budgets"
        >
          ← Back
        </Link>
        <h1 className="font-display text-2xl font-light text-white tracking-tight">
          {formatMonthYear(budget.month, budget.year)}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-charcoal-500 bg-charcoal-900/80 p-5 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-charcoal-400">Income</p>
          <DemoEditableIncome budgetId={id} income={Number(budget.income)} />
        </div>
        <div className="rounded-xl border border-charcoal-500 bg-charcoal-900/80 p-5 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-charcoal-400">Spent</p>
          <p className="text-xl font-light text-white">
            {formatCurrency(spent)}
          </p>
        </div>
        <div className="rounded-xl border border-charcoal-500 bg-charcoal-900/80 p-5 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-charcoal-400">Remaining</p>
          <p
            className={`text-xl font-light ${
              remaining >= 0 ? "text-accent-emerald-400" : "text-accent-rose-400"
            }`}
          >
            {formatCurrency(remaining)}
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-charcoal-400">
          Spending breakdown
        </h2>
        <DonutChartSpending
          data={donutData}
          emptyTitle="No spending this month"
          emptyDescription="Add expenses to see your breakdown by category."
        />
        {byCategory.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-center text-xs font-medium uppercase tracking-widest text-charcoal-400">
              By category
            </h2>
            <div className="rounded-xl border border-charcoal-500 bg-charcoal-900/80 p-4">
              <ul className="space-y-1 text-sm">
                {byCategory.map((row, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 rounded px-2 py-1"
                  >
                    {row.supercategory === "needs" ? (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-needs" aria-hidden />
                    ) : row.supercategory === "wants" ? (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-wants" aria-hidden />
                    ) : (
                      <span className="w-2 shrink-0" aria-hidden />
                    )}
                    <span
                      className={
                        row.supercategory === "needs"
                          ? "text-needs"
                          : row.supercategory === "wants"
                            ? "text-wants"
                            : "text-charcoal-200"
                      }
                    >
                      {row.categoryName}
                    </span>
                    <span
                      className={
                        row.supercategory === "needs"
                          ? "text-needs font-medium"
                          : row.supercategory === "wants"
                            ? "text-wants font-medium"
                            : "text-white"
                      }
                    >
                      {formatCurrency(row.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-charcoal-400">
          Add expense
        </h2>
        <DemoAddExpenseForm
          budgetId={id}
          categories={categories}
          budgets={budgetsList.map((b) => ({ id: b.id, month: b.month, year: b.year }))}
        />
      </section>

      <section>
        <h2 className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-charcoal-400">
          Expenses
        </h2>
        <DemoExpenseList expenses={expenses} categories={categories} budgetId={id} />
      </section>

      <DemoDeleteBudgetButton budgetId={id} />
    </div>
  );
}
