"use client";

import { useState } from "react";
import { addExpense } from "@/app/actions/expenses";
import type { Category } from "@/types/database";
import { CsvImportTrigger } from "../CsvImportTrigger";

export function AddExpenseForm({
  budgetId,
  categories,
  budgets,
}: {
  budgetId: string;
  categories?: Category[];
  budgets?: { id: string; month: number; year: number }[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setPending(true);
    const result = await addExpense(budgetId, formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }
    setPending(false);
    const form = document.getElementById("add-expense-form") as HTMLFormElement;
    form?.reset();
  };

  return (
    <form
      id="add-expense-form"
      action={handleSubmit}
      className="rounded-xl border border-charcoal-500 bg-charcoal-900 p-5"
    >
      {error && (
        <p className="mb-3 text-sm text-accent-rose-400" role="alert">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-xs font-medium uppercase tracking-widest text-charcoal-400"
          >
            Description
          </label>
          <input
            id="description"
            name="description"
            type="text"
            required
            placeholder="e.g. Groceries"
            className="w-full rounded-xl border border-charcoal-500 bg-charcoal-900/80 px-4 py-3 text-white placeholder-charcoal-300 focus:border-charcoal-400 focus:outline-none focus:ring-1 focus:ring-accent-violet-500"
          />
        </div>
        <div>
          <label
            htmlFor="amount"
            className="mb-1 block text-xs font-medium uppercase tracking-widest text-charcoal-400"
          >
            Amount ($)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="0.00"
            className="w-full rounded-xl border border-charcoal-500 bg-charcoal-900/80 px-4 py-3 text-white placeholder-charcoal-300 focus:border-charcoal-400 focus:outline-none focus:ring-1 focus:ring-accent-violet-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-accent-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-violet-400 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
          >
            {pending ? "Adding…" : "Add expense"}
          </button>
        </div>
        {categories && budgets && budgets.length > 0 && (
          <CsvImportTrigger categories={categories} budgets={budgets} />
        )}
      </div>
    </form>
  );
}
