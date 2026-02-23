import Link from "next/link";
import { notFound } from "next/navigation";
import { getBudgetById } from "@/app/actions/budgets";
import { getExpensesByBudgetId } from "@/app/actions/expenses";
import { getPaymentSources } from "@/app/actions/payment-sources";
import { getCategories } from "@/app/actions/categories";
import {
  totalSpent,
  formatMonthYear,
  formatCurrency,
  groupExpensesBySupercategory,
  groupExpensesByCategory,
} from "@/lib/helpers";
import { AddExpenseForm } from "./AddExpenseForm";
import { EditableIncome } from "./EditableIncome";
import { ExpenseList } from "./ExpenseList";
import { DeleteBudgetButton } from "./DeleteBudgetButton";

export default async function BudgetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [budget, expenses, paymentSources, categories] = await Promise.all([
    getBudgetById(id),
    getExpensesByBudgetId(id),
    getPaymentSources(),
    getCategories(),
  ]);
  if (!budget) notFound();

  const spent = totalSpent(expenses);
  const remaining = Number(budget.income) - spent;
  const bySuper = groupExpensesBySupercategory(expenses, categories);
  const byCategory = groupExpensesByCategory(expenses, categories);

  return (
    <div className="space-y-8">
      <div className="relative flex items-center justify-center py-1">
        <Link
          href="/dashboard"
          className="absolute left-0 shrink-0 text-charcoal-300 hover:text-white transition-colors duration-200"
          aria-label="Back to budgets"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          {formatMonthYear(budget.month, budget.year)}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-5 text-center">
          <p className="text-sm text-charcoal-300">Income</p>
          <EditableIncome budgetId={id} income={Number(budget.income)} />
        </div>
        <div className="rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-5 text-center">
          <p className="text-sm text-charcoal-300">Spent</p>
          <p className="text-xl font-semibold text-white">
            {formatCurrency(spent)}
          </p>
        </div>
        <div className="rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-5 text-center">
          <p className="text-sm text-charcoal-300">Remaining</p>
          <p
            className={`text-xl font-semibold ${
              remaining >= 0 ? "text-accent-emerald-400" : "text-accent-rose-400"
            }`}
          >
            {formatCurrency(remaining)}
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-center text-lg font-medium text-white">
          Grouped totals
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-charcoal-500 border-l-4 border-l-needs-secondary bg-needs-secondary/10 p-4 text-center">
            <p className="text-sm text-needs">Needs</p>
            <p className="text-lg font-semibold text-needs">
              {formatCurrency(bySuper.needs)}
            </p>
          </div>
          <div className="rounded-lg border border-charcoal-500 border-l-4 border-l-wants-secondary bg-wants-secondary/10 p-4 text-center">
            <p className="text-sm text-wants">Wants</p>
            <p className="text-lg font-semibold text-wants">
              {formatCurrency(bySuper.wants)}
            </p>
          </div>
          <div className="rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-4 text-center">
            <p className="text-sm text-charcoal-300">Misc</p>
            <p className="text-lg font-semibold text-white">
              {formatCurrency(bySuper.misc)}
            </p>
          </div>
        </div>
        {byCategory.length > 0 && (
          <div className="mt-3 rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-4">
            <p className="mb-2 text-sm text-charcoal-300">By category</p>
            <ul className="space-y-1 text-sm">
              {byCategory.map((row, i) => (
                <li
                  key={i}
                  className={`flex justify-between gap-2 rounded px-2 py-1 ${
                    row.supercategory === "needs"
                      ? "border-l-2 border-l-needs-secondary bg-needs-secondary/10 pl-3"
                      : row.supercategory === "wants"
                        ? "border-l-2 border-l-wants-secondary bg-wants-secondary/10 pl-3"
                        : ""
                  }`}
                >
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
        )}
      </section>

      <section>
        <h2 className="mb-3 text-center text-lg font-medium text-white">Add expense</h2>
        <AddExpenseForm budgetId={id} paymentSources={paymentSources} />
      </section>

      <section>
        <h2 className="mb-3 text-center text-lg font-medium text-white">Expenses</h2>
        <ExpenseList expenses={expenses} categories={categories} budgetId={id} />
      </section>

      <DeleteBudgetButton budgetId={id} />
    </div>
  );
}
