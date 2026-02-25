"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteBudget } from "@/app/actions/budgets";

export function DeleteBudgetButton({ budgetId }: { budgetId: string }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setError(null);
    setPending(true);
    const result = await deleteBudget(budgetId);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setShowConfirm(false);
    router.push("/dashboard");
  }

  return (
    <>
      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={() => {
            setShowConfirm(true);
            setError(null);
          }}
          className="rounded-lg border-2 border-accent-rose-500 bg-transparent px-4 py-2 text-sm font-medium text-accent-rose-500 transition-colors hover:bg-accent-rose-500 hover:text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-accent-rose-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
        >
          Delete budget
        </button>
      </div>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          aria-labelledby="delete-budget-title"
          onClick={() => {
            setShowConfirm(false);
            setError(null);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-charcoal-500 bg-charcoal-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="delete-budget-title"
              className="mb-4 text-center text-lg font-medium text-white"
            >
              Are you sure you want to delete this budget?
            </h2>
            <p className="mb-4 text-center text-sm text-charcoal-300">
              This will permanently remove this month&apos;s budget and all its
              expenses.
            </p>
            {error && (
              <p
                className="mb-4 text-center text-sm text-accent-rose-400"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setError(null);
                }}
                className="btn-secondary flex-1"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={pending}
                className="flex-1 rounded-lg border-2 border-accent-rose-500 bg-transparent px-3 py-2 text-sm font-medium text-accent-rose-500 transition-colors hover:bg-charcoal-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent-rose-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
              >
                {pending ? "Deleting…" : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
