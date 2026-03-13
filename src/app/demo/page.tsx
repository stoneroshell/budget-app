"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import { useDemo } from "@/contexts/DemoContext";
import {
  formatCurrency,
  totalSpent,
  groupExpensesBySupercategory,
  groupExpensesByCategory,
  needsWantsRatio,
} from "@/lib/helpers";
import {
  buildLineChartData,
  buildDonutChartData,
} from "@/lib/dashboard-chart-data";
import {
  getPreviousMonth,
  generateMonthlyInsights,
  type MonthSnapshot,
} from "@/lib/monthly-insights";
import { DemoCreateBudgetForm } from "./DemoCreateBudgetForm";
import { YearMonthGrid } from "@/app/dashboard/YearMonthGrid";
import { EmptyState } from "@/components/EmptyState";
import { NeedsWantsBar } from "@/components/NeedsWantsBar";
import { ChartScopeToggle } from "@/components/ChartScopeToggle";
import { LineChartSpendingOverTime } from "@/components/charts/LineChartSpendingOverTime";
import { DemoCsvImportTrigger } from "./DemoCsvImportTrigger";

function DemoDashboardContent() {
  const searchParams = useSearchParams();
  const budgetParam = searchParams.get("budget");
  const demo = useDemo();

  const budgets = useMemo(() => demo.getBudgetsWithNetIncome(), [demo]);
  const selectedId =
    budgetParam && budgets.some((b) => b.id === budgetParam)
      ? budgetParam
      : budgets[0]?.id ?? null;

  const budget = selectedId ? demo.getBudgetById(selectedId) : null;
  const expenses = selectedId ? demo.getExpensesByBudgetId(selectedId) : [];
  const categories = useMemo(() => demo.getCategories(), [demo]);
  const allTimeExpenses = useMemo(
    () => (budgets.length > 0 ? demo.getExpensesByBudgetIds(budgets.map((b) => b.id)) : []),
    [demo, budgets]
  );

  const income = budget ? Number(budget.income) : 0;
  const spent = totalSpent(expenses);
  const remaining = income - spent;
  const bySuper = groupExpensesBySupercategory(expenses, categories);
  const byCategory = groupExpensesByCategory(expenses, categories);
  const donutData = buildDonutChartData(byCategory);
  const bySuperAllTime = groupExpensesBySupercategory(allTimeExpenses, categories);
  const byCategoryAllTime = groupExpensesByCategory(allTimeExpenses, categories);
  const donutDataAllTime = buildDonutChartData(byCategoryAllTime);
  const lineData = buildLineChartData(budgets);
  const { needsPercent, wantsPercent } = needsWantsRatio(bySuper);

  const selectedYear =
    budget?.year ?? budgets[0]?.year ?? new Date().getFullYear();
  const yearBudgetIds = budgets.filter((b) => b.year === selectedYear).map((b) => b.id);
  const yearExpenses = allTimeExpenses.filter((e) => yearBudgetIds.includes(e.budget_id));
  const bySuperYear = groupExpensesBySupercategory(yearExpenses, categories);
  const byCategoryYear = groupExpensesByCategory(yearExpenses, categories);
  const yearDonutData = buildDonutChartData(byCategoryYear);

  let previousBudget: (typeof budgets)[0] | null = null;
  let insights: { text: string; type?: "info" | "highlight" }[] = [];
  if (budget && budgets.length > 0) {
    const prev = getPreviousMonth(budget.month, budget.year);
    previousBudget =
      budgets.find((b) => b.month === prev.month && b.year === prev.year) ?? null;
    if (previousBudget) {
      const prevExpenses = allTimeExpenses.filter((e) => e.budget_id === previousBudget!.id);
      const spentPrev = totalSpent(prevExpenses);
      const bySuperPrev = groupExpensesBySupercategory(prevExpenses, categories);
      const byCategoryPrev = groupExpensesByCategory(prevExpenses, categories);
      const currentSnapshot: MonthSnapshot = {
        income,
        spent,
        bySuper,
        byCategory,
        month: budget.month,
        year: budget.year,
      };
      const previousSnapshot: MonthSnapshot = {
        income: Number(previousBudget.income),
        spent: spentPrev,
        bySuper: bySuperPrev,
        byCategory: byCategoryPrev,
      };
      insights = generateMonthlyInsights(currentSnapshot, previousSnapshot);
    }
  }

  if (!demo.isHydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-charcoal-400">Loading demo…</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      <div className="space-y-6">
        <div className="-mb-3 mt-8 flex flex-col items-center gap-3 text-center">
          <h1 className="font-display text-6xl font-light text-white tracking-tight">
            Dashboard
          </h1>
          <DemoCreateBudgetForm />
        </div>

        {budgets.length === 0 ? (
          <div className="rounded-xl border border-charcoal-500 bg-charcoal-900/80 p-8">
            <EmptyState
              title="No budgets yet"
              description="Create a monthly budget above to get started."
            />
          </div>
        ) : (
          <>
            <section className="space-y-4 py-2 sm:space-y-5 sm:py-4">
              <YearMonthGrid
                budgets={budgets}
                selectedBudgetId={selectedId}
                selectedMonth={budget?.month ?? budgets[0]?.month ?? new Date().getMonth() + 1}
                selectedYear={budget?.year ?? budgets[0]?.year ?? new Date().getFullYear()}
                basePath="/demo"
              />
            </section>

            {budget && (
              <section>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-charcoal-500 bg-charcoal-900/80 p-5 text-center">
                    <p className="text-xs font-medium uppercase tracking-widest text-charcoal-400">Income</p>
                    <p className="text-xl font-light text-white">
                      {formatCurrency(income)}
                    </p>
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
                        remaining >= 0
                          ? "text-accent-emerald-400"
                          : "text-accent-rose-400"
                      }`}
                    >
                      {formatCurrency(remaining)}
                    </p>
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-charcoal-500 bg-charcoal-900/80 p-5">
                    <NeedsWantsBar
                      needsAmount={bySuper.needs}
                      wantsAmount={bySuper.wants}
                      needsPercent={needsPercent}
                      wantsPercent={wantsPercent}
                    />
                  </div>
                </div>
              </section>
            )}

            {budget && (
              <section className="space-y-6" aria-label="Spending charts">
                <h2 className="mb-4 font-display text-center text-2xl font-light text-white tracking-tight">
                  Spending overview
                </h2>
                <ChartScopeToggle
                  monthDonutData={donutData}
                  allTimeDonutData={donutDataAllTime}
                  monthBySuper={bySuper}
                  allTimeBySuper={bySuperAllTime}
                  yearDonutData={yearDonutData}
                  yearBySuper={bySuperYear}
                  selectedYear={selectedYear}
                />
                <div>
                  <h3 className="mb-2 text-center text-xs font-medium uppercase tracking-widest text-charcoal-400">
                    Spending over time
                  </h3>
                  <LineChartSpendingOverTime data={lineData} />
                </div>
              </section>
            )}

            {budget && (
              <section aria-label="Monthly insights">
                <h2 className="mb-4 font-display text-center text-2xl font-light text-white tracking-tight">
                  Monthly insights
                </h2>
                {previousBudget === null ? (
                  <div className="rounded-xl border border-charcoal-500 bg-charcoal-900/80 p-8">
                    <EmptyState
                      title="No month-over-month data"
                      description="Add another month to see month-over-month comparisons."
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-charcoal-500 bg-charcoal-900/80 p-5">
                    <ul
                      className="space-y-3 text-sm"
                      aria-label="Insights for this month"
                    >
                      {insights.map((insight, i) => (
                        <li
                          key={i}
                          className={
                            insight.type === "highlight"
                              ? "text-accent-violet-400"
                              : "text-charcoal-300"
                          }
                        >
                          {insight.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {budgets.length > 0 && categories.length > 0 && (
              <div className="flex justify-end">
                <DemoCsvImportTrigger
                  categories={categories}
                  budgets={budgets.map((b) => ({ id: b.id, month: b.month, year: b.year }))}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-charcoal-400">Loading…</p>
        </div>
      }
    >
      <DemoDashboardContent />
    </Suspense>
  );
}
