"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateExpenseCategory } from "@/app/actions/expenses";
import {
  createCategory,
  deleteOrHideCategory,
  type Supercategory,
} from "@/app/actions/categories";
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
  const categorySuper = new Map(categories.map((c) => [c.id, c.supercategory]));
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [addName, setAddName] = useState("");
  const [addSupercategory, setAddSupercategory] = useState<Supercategory>("wants");
  const [addError, setAddError] = useState<string | null>(null);
  const [addPending, setAddPending] = useState(false);
  const [deleteConfirmCategoryId, setDeleteConfirmCategoryId] = useState<
    string | null
  >(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleCategoryChange(
    expenseId: string,
    categoryId: string | null
  ) {
    const result = await updateExpenseCategory(expenseId, categoryId);
    if (!result?.error) router.refresh();
  }

  function openAddCategory() {
    setAddName("");
    setAddSupercategory("wants");
    setAddError(null);
    setShowAddCategory(true);
  }

  function openDeleteConfirm(categoryId: string) {
    setDeleteConfirmCategoryId(categoryId);
    setDeleteError(null);
  }

  async function handleConfirmDelete() {
    if (!deleteConfirmCategoryId) return;
    setDeleteError(null);
    setDeletePending(true);
    const result = await deleteOrHideCategory(deleteConfirmCategoryId);
    setDeletePending(false);
    if (result?.error) {
      setDeleteError(result.error);
      return;
    }
    setDeleteConfirmCategoryId(null);
    router.refresh();
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    setAddPending(true);
    const result = await createCategory(addName.trim(), addSupercategory);
    setAddPending(false);
    if (result?.error) {
      setAddError(result.error);
      return;
    }
    setShowAddCategory(false);
    router.refresh();
  }

  if (expenses.length === 0) {
    return (
      <p className="rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-5 text-center text-charcoal-300">
        No expenses yet. Add one above.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {expenses.map((e) => {
          const supercat = categorySuper.get(e.category_id ?? miscCategoryId);
          const rowAccent =
            supercat === "needs"
              ? "border-l-4 border-l-needs-secondary bg-needs-secondary/10"
              : supercat === "wants"
                ? "border-l-4 border-l-wants-secondary bg-wants-secondary/10"
                : "";
          return (
          <li
            key={e.id}
            className={`group flex flex-wrap items-center justify-between gap-2 rounded-lg border border-charcoal-500 bg-charcoal-900/80 px-4 py-3 odd:bg-charcoal-900/50 ${rowAccent}`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="text-white">{e.description}</span>
              <div className="flex items-center gap-1">
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
                <button
                  type="button"
                  onClick={openAddCategory}
                  aria-label="Add custom category"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-accent-violet-500 bg-charcoal-800/80 text-accent-violet-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-charcoal-700 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
                >
                  <span className="text-sm font-medium leading-none">+</span>
                </button>
                {(e.category_id ?? miscCategoryId) !== miscCategoryId && (
                  <button
                    type="button"
                    onClick={() =>
                      openDeleteConfirm(e.category_id ?? miscCategoryId)
                    }
                    aria-label="Remove category"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-accent-rose-500 bg-charcoal-800/80 text-accent-rose-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-charcoal-700 focus:outline-none focus:ring-2 focus:ring-accent-rose-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
                  >
                    <span className="text-sm font-medium leading-none">−</span>
                  </button>
                )}
              </div>
            </div>
            <span
              className={
                categorySuper.get(e.category_id ?? miscCategoryId) === "needs"
                  ? "font-medium text-needs"
                  : categorySuper.get(e.category_id ?? miscCategoryId) === "wants"
                    ? "font-medium text-wants"
                    : "font-medium text-white"
              }
            >
              {formatCurrency(Number(e.amount))}
            </span>
          </li>
          );
        })}
      </ul>

      {showAddCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="add-category-title"
          onClick={() => {
            setShowAddCategory(false);
            setAddError(null);
          }}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-charcoal-500 bg-charcoal-900 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="add-category-title"
              className="mb-4 text-center text-lg font-medium text-white"
            >
              New category
            </h2>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              {addError && (
                <p className="text-sm text-accent-rose-400" role="alert">
                  {addError}
                </p>
              )}
              <div>
                <label
                  htmlFor="new-category-name"
                  className="mb-1 block text-sm text-charcoal-300"
                >
                  Name
                </label>
                <input
                  id="new-category-name"
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Pet supplies"
                  autoFocus
                  className="w-full rounded border border-charcoal-500 bg-charcoal-800 px-3 py-2 text-white placeholder-charcoal-400 focus:border-accent-violet-500 focus:outline-none focus:ring-1 focus:ring-accent-violet-500"
                />
              </div>
              <div>
                <span className="mb-2 block text-sm text-charcoal-300">
                  Type
                </span>
                <div
                  className="flex rounded-lg border border-charcoal-500 bg-charcoal-800 p-0.5"
                  role="radiogroup"
                  aria-label="Category type"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={addSupercategory === "needs"}
                    onClick={() => setAddSupercategory("needs")}
                    className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-needs focus:ring-offset-2 focus:ring-offset-charcoal-900 ${
                      addSupercategory === "needs"
                        ? "bg-needs text-white"
                        : "bg-transparent text-needs hover:bg-needs-secondary/20"
                    }`}
                  >
                    Needs
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={addSupercategory === "wants"}
                    onClick={() => setAddSupercategory("wants")}
                    className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-wants focus:ring-offset-2 focus:ring-offset-charcoal-900 ${
                      addSupercategory === "wants"
                        ? "bg-wants text-white"
                        : "bg-transparent text-wants hover:bg-wants-secondary/20"
                    }`}
                  >
                    Wants
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategory(false);
                    setAddError(null);
                  }}
                  className="flex-1 rounded-md border border-charcoal-500 px-3 py-2 text-sm font-medium text-charcoal-200 hover:bg-charcoal-700 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addPending}
                  className="flex-1 rounded-md border border-accent-violet-500 bg-charcoal-800 px-3 py-2 text-sm font-medium text-accent-violet-500 hover:bg-charcoal-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
                >
                  {addPending ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmCategoryId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="delete-category-title"
          onClick={() => {
            setDeleteConfirmCategoryId(null);
            setDeleteError(null);
          }}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-charcoal-500 bg-charcoal-900 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="delete-category-title"
              className="mb-4 text-center text-lg font-medium text-white"
            >
              Are you sure you want to delete this category?
            </h2>
            {deleteError && (
              <p className="mb-4 text-center text-sm text-accent-rose-400" role="alert">
                {deleteError}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCategoryId(null)}
                className="flex-1 rounded-md border border-charcoal-500 px-3 py-2 text-sm font-medium text-charcoal-200 hover:bg-charcoal-700 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletePending}
                className="flex-1 rounded-md border border-accent-rose-500 bg-charcoal-800 px-3 py-2 text-sm font-medium text-accent-rose-500 hover:bg-charcoal-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent-rose-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
              >
                {deletePending ? "Removing…" : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
