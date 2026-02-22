import Link from "next/link";
import { getBudgets } from "@/app/actions/budgets";
import { formatMonthYear } from "@/lib/helpers";
import { CreateBudgetForm } from "./CreateBudgetForm";

export default async function DashboardPage() {
  const budgets = await getBudgets();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Your budgets</h1>
        <CreateBudgetForm />
      </div>

      {budgets.length === 0 ? (
        <div className="rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-8 text-center text-charcoal-300">
          <p className="mb-2">No budgets yet.</p>
          <p className="text-sm">Create a monthly budget above to get started.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {budgets.map((b) => (
            <li key={b.id}>
              <Link
                href={`/dashboard/${b.id}`}
                className="block rounded-lg border border-charcoal-500 bg-charcoal-900/80 px-5 py-3.5 text-white hover:border-charcoal-400 hover:bg-charcoal-800/80 transition-colors duration-200"
              >
                <span className="font-medium">
                  {formatMonthYear(b.month, b.year)}
                </span>
                <span className="ml-2 text-charcoal-300">
                  — Income: ${Number(b.income).toFixed(2)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
