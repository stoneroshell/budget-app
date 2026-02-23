"use client";

import { useState } from "react";
import { createBudget } from "@/app/actions/budgets";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

export function CreateBudgetForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setPending(true);
    const result = await createBudget(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }
    setOpen(false);
    setPending(false);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-md bg-accent-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-violet-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
      >
        {open ? "Cancel" : "New budget"}
      </button>

      {open && (
        <form
          action={handleSubmit}
          className="mt-4 rounded-lg border border-charcoal-500 bg-charcoal-900 p-5"
        >
          {error && (
            <p className="mb-3 text-sm text-accent-rose-400" role="alert">
              {error}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="month" className="mb-1 block text-sm text-charcoal-300">
                Month
              </label>
              <select
                id="month"
                name="month"
                required
                className="w-full rounded border border-charcoal-500 bg-charcoal-800 px-3 py-2 text-white placeholder-charcoal-300 focus:border-accent-violet-500 focus:outline-none focus:ring-1 focus:ring-accent-violet-500"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="year" className="mb-1 block text-sm text-charcoal-300">
                Year
              </label>
              <select
                id="year"
                name="year"
                required
                className="w-full rounded border border-charcoal-500 bg-charcoal-800 px-3 py-2 text-white focus:border-accent-violet-500 focus:outline-none focus:ring-1 focus:ring-accent-violet-500"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="income" className="mb-1 block text-sm text-charcoal-300">
                Monthly income ($)
              </label>
              <input
                id="income"
                name="income"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full rounded border border-charcoal-500 bg-charcoal-800 px-3 py-2 text-white placeholder-charcoal-300 focus:border-accent-violet-500 focus:outline-none focus:ring-1 focus:ring-accent-violet-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-accent-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-violet-400 transition-colors duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
            >
              {pending ? "Creating…" : "Create budget"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
