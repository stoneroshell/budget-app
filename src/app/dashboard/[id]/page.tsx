import Link from "next/link";
import { notFound } from "next/navigation";
import { getBudgetById } from "@/app/actions/budgets";
import { getExpensesByBudgetId } from "@/app/actions/expenses";
import { getPaymentSources } from "@/app/actions/payment-sources";
import { totalSpent, formatMonthYear, formatCurrency } from "@/lib/helpers";
import { AddExpenseForm } from "./AddExpenseForm";

export default async function BudgetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [budget, expenses, paymentSources] = await Promise.all([
    getBudgetById(id),
    getExpensesByBudgetId(id),
    getPaymentSources(),
  ]);
  if (!budget) notFound();

  const spent = totalSpent(expenses);
  const remaining = Number(budget.income) - spent;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-charcoal-300 hover:text-white transition-colors duration-200"
          aria-label="Back to budgets"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          {formatMonthYear(budget.month, budget.year)}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-5">
          <p className="text-sm text-charcoal-300">Income</p>
          <p className="text-xl font-semibold text-white">
            {formatCurrency(Number(budget.income))}
          </p>
        </div>
        <div className="rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-5">
          <p className="text-sm text-charcoal-300">Spent</p>
          <p className="text-xl font-semibold text-white">
            {formatCurrency(spent)}
          </p>
        </div>
        <div className="rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-5">
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
        <h2 className="mb-3 text-lg font-medium text-white">Add expense</h2>
        <AddExpenseForm budgetId={id} paymentSources={paymentSources} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-white">Expenses</h2>
        {expenses.length === 0 ? (
          <p className="rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-5 text-center text-charcoal-300">
            No expenses yet. Add one above.
          </p>
        ) : (
          <ul className="space-y-2">
            {expenses.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-charcoal-500 bg-charcoal-900/80 px-4 py-3 odd:bg-charcoal-900/50"
              >
                <div>
                  <span className="text-white">{e.description}</span>
                  {e.payment_label && (
                    <span className="ml-2 text-sm text-charcoal-300">
                      ({e.payment_label})
                    </span>
                  )}
                </div>
                <span className="font-medium text-white">
                  {formatCurrency(Number(e.amount))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
