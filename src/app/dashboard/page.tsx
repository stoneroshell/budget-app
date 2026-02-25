import Link from "next/link";
import { getBudgetsWithNetIncome, getBudgetById } from "@/app/actions/budgets";
import { getExpensesByBudgetId, getExpensesByBudgetIds } from "@/app/actions/expenses";
import { getCategories } from "@/app/actions/categories";
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
import { CreateBudgetForm } from "./CreateBudgetForm";
import { CsvImportTrigger } from "./CsvImportTrigger";
import { YearMonthGrid } from "./YearMonthGrid";
import { EmptyState } from "@/components/EmptyState";
import { NeedsWantsBar } from "@/components/NeedsWantsBar";
import { ChartScopeToggle } from "@/components/ChartScopeToggle";
import { LineChartSpendingOverTime } from "@/components/charts/LineChartSpendingOverTime";

type PageProps = {
  searchParams: Promise<{ budget?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const { budget: budgetParam } = await searchParams;
  const budgets = await getBudgetsWithNetIncome();

  const selectedId =
    budgetParam && budgets.some((b) => b.id === budgetParam)
      ? budgetParam
      : budgets[0]?.id ?? null;

  let budget: Awaited<ReturnType<typeof getBudgetById>> = null;
  let expenses: Awaited<ReturnType<typeof getExpensesByBudgetId>> = [];
  let allTimeExpenses: Awaited<ReturnType<typeof getExpensesByBudgetIds>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  if (selectedId) {
    const [budgetResult, expensesResult, categoriesResult, allTimeResult] =
      await Promise.all([
        getBudgetById(selectedId),
        getExpensesByBudgetId(selectedId),
        getCategories(),
        budgets.length > 0
          ? getExpensesByBudgetIds(budgets.map((b) => b.id))
          : Promise.resolve([]),
      ]);
    budget = budgetResult;
    expenses = expensesResult;
    categories = categoriesResult;
    allTimeExpenses = allTimeResult;
  }

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

  // Year-scoped data for "This year" chart scope (selected budget's year)
  const selectedYear =
    budget?.year ?? budgets[0]?.year ?? new Date().getFullYear();
  const yearBudgetIds = budgets
    .filter((b) => b.year === selectedYear)
    .map((b) => b.id);
  const yearExpenses = allTimeExpenses.filter((e) =>
    yearBudgetIds.includes(e.budget_id)
  );
  const bySuperYear = groupExpensesBySupercategory(yearExpenses, categories);
  const byCategoryYear = groupExpensesByCategory(yearExpenses, categories);
  const yearDonutData = buildDonutChartData(byCategoryYear);

  // Resolve previous calendar month for insights (no extra fetch: use allTimeExpenses)
  let previousBudget: (typeof budgets)[0] | null = null;
  let prevExpenses: typeof expenses = [];
  let insights: { text: string; type?: "info" | "highlight" }[] = [];
  if (budget && budgets.length > 0) {
    const prev = getPreviousMonth(budget.month, budget.year);
    previousBudget =
      budgets.find((b) => b.month === prev.month && b.year === prev.year) ??
      null;
    if (previousBudget) {
      prevExpenses = allTimeExpenses.filter(
        (e) => e.budget_id === previousBudget!.id
      );
      const spentPrev = totalSpent(prevExpenses);
      const bySuperPrev = groupExpensesBySupercategory(
        prevExpenses,
        categories
      );
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

  return (
    <div className="relative min-h-full">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 text-center sm:flex-row sm:justify-center sm:items-center sm:gap-6">
          <h1 className="font-display text-6xl font-light text-white tracking-tight">
            Dashboard
          </h1>
          <CreateBudgetForm />
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
          {/* Year + month grid selector */}
          <section className="space-y-4 py-2 sm:space-y-5 sm:py-4">
            <h2 className="text-center text-xs font-medium uppercase tracking-widest text-charcoal-400">
              View month
            </h2>
            <YearMonthGrid
              budgets={budgets}
              selectedBudgetId={selectedId}
              selectedMonth={budget?.month ?? budgets[0]?.month ?? new Date().getMonth() + 1}
              selectedYear={budget?.year ?? budgets[0]?.year ?? new Date().getFullYear()}
            />
          </section>

          {/* Summary cards (when a month is selected) */}
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

          {/* Charts: donut + bar, then line */}
          {budget && (
            <section
              className="space-y-6"
              aria-label="Spending charts"
            >
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

          {/* Monthly Insights */}
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

          {/* Export */}
          {budgets.length > 0 && categories.length > 0 && (
            <div className="flex justify-end">
              <CsvImportTrigger
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
