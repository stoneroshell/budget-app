"use client";

import { useRouter } from "next/navigation";
import { updateExpenseCategory } from "@/app/actions/expenses";
import { formatCurrency } from "@/lib/helpers";
import type { Expense } from "@/types/database";
import type { Category } from "@/types/database";

export function ExpenseList({
  expenses,
  categories,
  budgetId,
}: {
  expenses: Expense[];
  categories: Category[];
  budgetId: string;
}) {
  const router = useRouter();
  const miscCategoryId = categories.find((c) => c.name === "Misc")?.id ?? "";

  async function handleCategoryChange(
    expenseId: string,
    categoryId: string | null
  ) {
    const result = await updateExpenseCategory(expenseId, categoryId);
    if (!result?.error) router.refresh();
  }

  if (expenses.length === 0) {
    return (
      <p className="rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-5 text-center text-charcoal-300">
        No expenses yet. Add one above.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {expenses.map((e) => (
        <li
          key={e.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-charcoal-500 bg-charcoal-900/80 px-4 py-3 odd:bg-charcoal-900/50"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="text-white">{e.description}</span>
            <select
              aria-label={`Category for ${e.description}`}
              value={e.category_id ?? miscCategoryId}
              onChange={(ev) => handleCategoryChange(e.id, ev.target.value)}
              className="shrink-0 rounded border border-charcoal-500 bg-charcoal-800 px-2 py-1 text-sm text-charcoal-200 focus:border-accent-violet-500 focus:outline-none focus:ring-1 focus:ring-accent-violet-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <span className="font-medium text-white">
            {formatCurrency(Number(e.amount))}
          </span>
        </li>
      ))}
    </ul>
  );
}
