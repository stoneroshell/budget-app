"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateBudgetIncome } from "@/app/actions/budgets";
import { formatCurrency } from "@/lib/helpers";

export function EditableIncome({
  budgetId,
  income,
}: {
  budgetId: string;
  income: number;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(String(income));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setValue(String(income));
      setError(null);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing, income]);

  async function handleSave() {
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
    if (Number.isNaN(parsed) || parsed < 0) {
      setError("Enter a valid amount (0 or more).");
      return;
    }
    setError(null);
    setPending(true);
    const result = await updateBudgetIncome(budgetId, parsed);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setIsEditing(false);
    router.refresh();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setValue(String(income));
      setError(null);
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return (
      <div className="relative flex flex-col items-center">
        <div className="flex items-center justify-center gap-2">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Income amount"
            aria-invalid={!!error}
            aria-describedby={error ? "income-error" : undefined}
            className="w-28 rounded border border-charcoal-500 bg-charcoal-800 px-2 py-1 text-center text-xl font-semibold text-white focus:border-accent-violet-500 focus:outline-none focus:ring-1 focus:ring-accent-violet-500"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            aria-label="Save income"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-charcoal-500 text-charcoal-200 hover:border-accent-emerald-500 hover:bg-accent-emerald-500/10 hover:text-accent-emerald-400 focus:outline-none focus:ring-2 focus:ring-accent-emerald-500 focus:ring-offset-2 focus:ring-offset-charcoal-900 disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        {error && (
          <p id="income-error" className="mt-1 text-center text-sm text-accent-rose-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <p
        role="button"
        tabIndex={0}
        onClick={() => setIsEditing(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsEditing(true);
          }
        }}
        aria-label="Edit income"
        className="cursor-text rounded border border-transparent px-2 py-1 text-xl font-semibold text-white outline-none hover:border-charcoal-500 hover:bg-charcoal-800/80 focus:border-accent-violet-500 focus:ring-1 focus:ring-accent-violet-500"
      >
        {formatCurrency(income)}
      </p>
    </div>
  );
}
