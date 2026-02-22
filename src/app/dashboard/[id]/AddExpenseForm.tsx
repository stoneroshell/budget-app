"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addExpense } from "@/app/actions/expenses";
import { createPaymentSource } from "@/app/actions/payment-sources";
import { PAYMENT_SOURCE_COLORS, type PaymentSourceColor } from "@/lib/payment-source-colors";
import type { PaymentSource } from "@/types/database";

const ADD_SOURCE_VALUE = "__add__";

export function AddExpenseForm({
  budgetId,
  paymentSources,
}: {
  budgetId: string;
  paymentSources: PaymentSource[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showAddSource, setShowAddSource] = useState(false);
  const [addSourceName, setAddSourceName] = useState("");
  const [addSourceColor, setAddSourceColor] = useState<PaymentSourceColor>(PAYMENT_SOURCE_COLORS[0]);
  const [addSourceError, setAddSourceError] = useState<string | null>(null);
  const [addSourcePending, setAddSourcePending] = useState(false);
  const [selectedSource, setSelectedSource] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setPending(true);
    const paymentLabel =
      selectedSource === ADD_SOURCE_VALUE ? "" : selectedSource;
    formData.set("payment_label", paymentLabel);
    const result = await addExpense(budgetId, formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }
    setPending(false);
    setSelectedSource("");
    const form = document.getElementById("add-expense-form") as HTMLFormElement;
    form?.reset();
    setShowAddSource(false);
  };

  const handleSourceChange = (value: string) => {
    setSelectedSource(value);
    if (value === ADD_SOURCE_VALUE) {
      setShowAddSource(true);
      setAddSourceError(null);
    } else {
      setShowAddSource(false);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSourceError(null);
    setAddSourcePending(true);
    const result = await createPaymentSource(
      addSourceName.trim(),
      addSourceColor,
      budgetId
    );
    setAddSourcePending(false);
    if (result?.error) {
      setAddSourceError(result.error);
      return;
    }
    setAddSourceName("");
    setAddSourceColor(PAYMENT_SOURCE_COLORS[0]);
    setSelectedSource("");
    setShowAddSource(false);
    router.refresh();
  };

  return (
    <form
      id="add-expense-form"
      action={handleSubmit}
      className="rounded-lg border border-charcoal-500 bg-charcoal-900 p-5"
    >
      {error && (
        <p className="mb-3 text-sm text-accent-rose-400" role="alert">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <label
            htmlFor="description"
            className="mb-1 block text-sm text-charcoal-300"
          >
            Description
          </label>
          <input
            id="description"
            name="description"
            type="text"
            required
            placeholder="e.g. Groceries"
            className="w-full rounded border border-charcoal-500 bg-charcoal-800 px-3 py-2 text-white placeholder-charcoal-300 focus:border-accent-violet-500 focus:outline-none focus:ring-1 focus:ring-accent-violet-500"
          />
        </div>
        <div>
          <label
            htmlFor="amount"
            className="mb-1 block text-sm text-charcoal-300"
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
            className="w-full rounded border border-charcoal-500 bg-charcoal-800 px-3 py-2 text-white placeholder-charcoal-300 focus:border-accent-violet-500 focus:outline-none focus:ring-1 focus:ring-accent-violet-500"
          />
        </div>
        <div>
          <label
            htmlFor="payment_label"
            className="mb-1 block text-sm text-charcoal-300"
          >
            Source (optional)
          </label>
          <select
            id="payment_label"
            name="payment_label"
            value={selectedSource}
            onChange={(e) => handleSourceChange(e.target.value)}
            className="w-full rounded border border-charcoal-500 bg-charcoal-800 px-3 py-2 text-white focus:border-accent-violet-500 focus:outline-none focus:ring-1 focus:ring-accent-violet-500"
          >
            <option value="">None</option>
            {paymentSources.map((src) => (
              <option key={src.id} value={src.name}>
                {src.name}
              </option>
            ))}
            <option value={ADD_SOURCE_VALUE}>Add Source</option>
          </select>
        </div>
      </div>

      {showAddSource && (
        <div className="mt-4 rounded border border-charcoal-500 bg-charcoal-800/80 p-4">
          <p className="mb-3 text-sm font-medium text-white">Add payment source</p>
          {addSourceError && (
            <p className="mb-2 text-sm text-accent-rose-400" role="alert">
              {addSourceError}
            </p>
          )}
          <form onSubmit={handleAddSource} className="space-y-3">
            <div>
              <label
                htmlFor="new_source_name"
                className="mb-1 block text-xs text-charcoal-300"
              >
                Name
              </label>
              <input
                id="new_source_name"
                type="text"
                value={addSourceName}
                onChange={(e) => setAddSourceName(e.target.value)}
                placeholder="e.g. Chase Freedom"
                className="w-full rounded border border-charcoal-500 bg-charcoal-800 px-3 py-2 text-sm text-white placeholder-charcoal-300 focus:border-accent-violet-500 focus:outline-none focus:ring-1 focus:ring-accent-violet-500"
              />
            </div>
            <div>
              <span className="mb-2 block text-xs text-charcoal-300">Color</span>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_SOURCE_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setAddSourceColor(hex)}
                    className="h-8 w-8 rounded-full border-2 transition duration-200 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
                    style={{
                      backgroundColor: hex,
                      borderColor:
                        addSourceColor === hex ? "white" : "transparent",
                    }}
                    title={hex}
                    aria-label={`Color ${hex}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addSourcePending}
                className="rounded-md bg-charcoal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-charcoal-500 transition-colors duration-200 disabled:opacity-50"
              >
                {addSourcePending ? "Saving…" : "Save source"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddSource(false);
                  setAddSourceName("");
                  setAddSourceError(null);
                  setSelectedSource("");
                }}
                className="rounded-md border border-charcoal-500 px-3 py-1.5 text-sm text-charcoal-300 hover:bg-charcoal-700 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-violet-400 transition-colors duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
        >
          {pending ? "Adding…" : "Add expense"}
        </button>
      </div>
    </form>
  );
}
