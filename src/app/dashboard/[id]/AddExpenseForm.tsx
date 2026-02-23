"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addExpense } from "@/app/actions/expenses";
import { createPaymentSource, deletePaymentSource } from "@/app/actions/payment-sources";
import { PAYMENT_SOURCE_COLORS, type PaymentSourceColor } from "@/lib/payment-source-colors";
import type { PaymentSource } from "@/types/database";

const ADD_SOURCE_VALUE = "__add__";
const NONE_COLOR = "#A3A3A3";
const ADD_SOURCE_COLOR = "#3B82F6";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [deletePending, setDeletePending] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedPaymentSource = paymentSources.find((s) => s.name === selectedSource);

  const options: { value: string; label: string; color: string }[] = [
    { value: "", label: "None", color: NONE_COLOR },
    ...paymentSources.map((src) => ({ value: src.name, label: src.name, color: src.color })),
    { value: ADD_SOURCE_VALUE, label: "Add Source", color: ADD_SOURCE_COLOR },
  ];

  const triggerLabel =
    selectedSource === ""
      ? "None"
      : selectedSource === ADD_SOURCE_VALUE
        ? "Add Source"
        : selectedSource;
  const triggerColor =
    selectedSource === ""
      ? NONE_COLOR
      : selectedSource === ADD_SOURCE_VALUE
        ? ADD_SOURCE_COLOR
        : paymentSources.find((s) => s.name === selectedSource)?.color ?? NONE_COLOR;

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

  const handleAddSource = async () => {
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
    const nameAdded = addSourceName.trim();
    setAddSourceName("");
    setAddSourceColor(PAYMENT_SOURCE_COLORS[0]);
    setShowAddSource(false);
    setSelectedSource(nameAdded);
    router.refresh();
  };

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const idx = options.findIndex((o) => o.value === selectedSource);
    setFocusedIndex(idx >= 0 ? idx : 0);
  }, [dropdownOpen, selectedSource]);

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setDropdownOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setDropdownOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => (i < options.length - 1 ? i + 1 : 0));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => (i > 0 ? i - 1 : options.length - 1));
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSourceChange(options[focusedIndex].value);
      setDropdownOpen(false);
    }
  };

  const handleDeleteSource = async () => {
    if (!selectedPaymentSource) return;
    setDeletePending(true);
    await deletePaymentSource(selectedPaymentSource.id, budgetId);
    setSelectedSource("");
    setDeletePending(false);
    router.refresh();
  };

  useEffect(() => {
    if (!dropdownOpen || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${focusedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [dropdownOpen, focusedIndex]);

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
            className="w-full rounded border border-charcoal-500 bg-charcoal-800 px-3 py-2 text-white placeholder-charcoal-300 focus:border-accent-violet-500 focus:outline-none focus:ring-1 focus:ring-accent-violet-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
          />
        </div>
        <div ref={dropdownRef} className="relative">
          <label
            htmlFor="payment_label"
            className="mb-1 block text-sm text-charcoal-300"
          >
            Source (optional)
          </label>
          <input
            type="hidden"
            id="payment_label"
            name="payment_label"
            value={selectedSource === ADD_SOURCE_VALUE ? "" : selectedSource}
          />
          <button
            type="button"
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
            aria-label="Payment source"
            onClick={() => setDropdownOpen((open) => !open)}
            onKeyDown={handleDropdownKeyDown}
            className="w-full rounded-xl border border-charcoal-500 bg-charcoal-800 px-3 py-2 text-left text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
            style={{ color: triggerColor }}
          >
            {triggerLabel}
          </button>
          {dropdownOpen && (
            <ul
              ref={listRef}
              role="listbox"
              aria-label="Payment source"
              className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-auto rounded-xl border border-charcoal-500 bg-charcoal-800 py-1 shadow-lg"
            >
              {options.map((opt, index) => {
                const isHovered = hoveredValue === opt.value;
                return (
                  <li
                    key={opt.value || "none"}
                    role="option"
                    aria-selected={selectedSource === opt.value}
                    data-index={index}
                    tabIndex={-1}
                    className="cursor-pointer px-3 py-2 text-sm transition-colors duration-150"
                    style={{
                      backgroundColor: isHovered ? opt.color : "transparent",
                      color: isHovered ? "#fff" : opt.color,
                    }}
                    onMouseEnter={() => setHoveredValue(opt.value)}
                    onMouseLeave={() => setHoveredValue(null)}
                    onClick={() => {
                      handleSourceChange(opt.value);
                      setDropdownOpen(false);
                    }}
                    onFocus={() => setFocusedIndex(index)}
                  >
                    {opt.label}
                  </li>
                );
              })}
            </ul>
          )}
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
          <div className="space-y-3">
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
                type="button"
                onClick={handleAddSource}
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
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-violet-400 transition-colors duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
        >
          {pending ? "Adding…" : "Add expense"}
        </button>
        {selectedPaymentSource && (
          <button
            type="button"
            onClick={handleDeleteSource}
            disabled={deletePending}
            className="rounded-md border-2 border-accent-rose-500 bg-charcoal-800 px-3 py-2 text-sm font-medium text-accent-rose-500 hover:bg-charcoal-700 hover:border-accent-rose-400 hover:text-accent-rose-400 transition-colors duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent-rose-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
            aria-label={`Remove payment source ${selectedPaymentSource.name}`}
          >
            {deletePending ? "Removing…" : "Remove source"}
          </button>
        )}
      </div>
    </form>
  );
}
