"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  updateExpenseCategory,
  deleteExpense as deleteExpenseAction,
} from "@/app/actions/expenses";
import {
  createCategory,
  deleteOrHideCategory,
  type Supercategory,
} from "@/app/actions/categories";
import { formatCurrency } from "@/lib/helpers";
import { EmptyState } from "@/components/EmptyState";
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
  const userAddedCategoryIds = new Set(
    categories.filter((c) => c.user_id != null).map((c) => c.id)
  );
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
  const [openComboboxExpenseId, setOpenComboboxExpenseId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [expenseIdForNewCategory, setExpenseIdForNewCategory] = useState<
    string | null
  >(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const comboboxRef = useRef<HTMLDivElement>(null);

  async function handleDeleteExpense(expenseId: string) {
    setDeletingExpenseId(expenseId);
    const result = await deleteExpenseAction(expenseId);
    setDeletingExpenseId(null);
    if (!result?.error) router.refresh();
  }

  async function handleCategoryChange(
    expenseId: string,
    categoryId: string | null
  ) {
    const result = await updateExpenseCategory(expenseId, categoryId);
    if (!result?.error) router.refresh();
  }

  function openAddCategoryForExpense(expenseId: string, prefillName: string) {
    setAddName(prefillName);
    setAddSupercategory("wants");
    setAddError(null);
    setExpenseIdForNewCategory(expenseId);
    setShowAddCategory(true);
    setOpenComboboxExpenseId(null);
    setSearchQuery("");
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
    if (result?.id && expenseIdForNewCategory) {
      await updateExpenseCategory(expenseIdForNewCategory, result.id);
    }
    setExpenseIdForNewCategory(null);
    setShowAddCategory(false);
    router.refresh();
  }

  useEffect(() => {
    if (openComboboxExpenseId === null) return;
    const handleClickOutside = (ev: MouseEvent) => {
      if (
        comboboxRef.current &&
        !comboboxRef.current.contains(ev.target as Node)
      ) {
        setOpenComboboxExpenseId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openComboboxExpenseId]);

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-charcoal-500 bg-charcoal-900/80 p-8">
        <EmptyState
          title="No expenses yet"
          description="Add one above."
        />
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {expenses.map((e) => {
          const supercat = categorySuper.get(e.category_id ?? miscCategoryId);
          return (
          <li
            key={e.id}
            className="group flex flex-wrap items-center justify-between gap-2 rounded-xl border border-charcoal-500 bg-charcoal-900/80 px-4 py-3 transition-colors odd:bg-charcoal-900/50 hover:border-charcoal-400"
          >
            {supercat === "needs" ? (
              <span className="h-2 w-2 shrink-0 rounded-full bg-needs" aria-hidden />
            ) : supercat === "wants" ? (
              <span className="h-2 w-2 shrink-0 rounded-full bg-wants" aria-hidden />
            ) : (
              <span className="w-2 shrink-0" aria-hidden />
            )}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="text-white">{e.description}</span>
              <div
                ref={
                  openComboboxExpenseId === e.id ? comboboxRef : undefined
                }
                className="relative flex shrink-0 items-center gap-1"
              >
                {(() => {
                  const selectedId = e.category_id ?? miscCategoryId;
                  const selectedCategory = categories.find(
                    (c) => c.id === selectedId
                  );
                  const selectedName = selectedCategory?.name ?? "Misc";
                  const isOpen = openComboboxExpenseId === e.id;
                  const searchLower = searchQuery.toLowerCase();
                  const filteredCategories = categories.filter((c) =>
                    c.name.toLowerCase().includes(searchLower)
                  );
                  const optionCount = 1 + filteredCategories.length;

                  function handleComboboxKeyDown(
                    ev: React.KeyboardEvent<HTMLInputElement>
                  ) {
                    if (!isOpen) return;
                    if (ev.key === "ArrowDown") {
                      ev.preventDefault();
                      setFocusedIndex((i) =>
                        i < optionCount - 1 ? i + 1 : i
                      );
                    } else if (ev.key === "ArrowUp") {
                      ev.preventDefault();
                      setFocusedIndex((i) => (i > 0 ? i - 1 : 0));
                    } else if (ev.key === "Enter") {
                      ev.preventDefault();
                      const safeIndex = Math.min(
                        focusedIndex,
                        optionCount - 1
                      );
                      if (safeIndex === 0) {
                        openAddCategoryForExpense(e.id, searchQuery.trim());
                      } else {
                        const cat = filteredCategories[safeIndex - 1];
                        if (cat) {
                          handleCategoryChange(e.id, cat.id);
                          setOpenComboboxExpenseId(null);
                        }
                      }
                    } else if (ev.key === "Escape") {
                      ev.preventDefault();
                      setOpenComboboxExpenseId(null);
                    }
                  }

                  return (
                    <>
                      <input
                        type="text"
                        aria-label={`Category for ${e.description}`}
                        aria-expanded={isOpen}
                        aria-autocomplete="list"
                        role="combobox"
                        value={isOpen ? searchQuery : selectedName}
                        onChange={(ev) =>
                          setSearchQuery(ev.target.value)
                        }
                        onFocus={() => {
                          setOpenComboboxExpenseId(e.id);
                          setSearchQuery("");
                          setFocusedIndex(0);
                        }}
                        onKeyDown={handleComboboxKeyDown}
                        className="w-32 shrink-0 rounded-xl border border-charcoal-500 bg-charcoal-900/80 px-2 py-1 text-sm text-charcoal-200 transition-colors focus:border-charcoal-400 focus:outline-none focus:ring-1 focus:ring-accent-violet-500"
                      />
                      {isOpen && (
                        <ul
                          role="listbox"
                          className="absolute left-0 top-full z-10 mt-1 max-h-56 w-48 overflow-auto rounded-lg border border-charcoal-500 bg-charcoal-800 py-1 shadow-lg"
                          aria-label="Category"
                        >
                          <li
                            role="option"
                            aria-selected={focusedIndex === 0}
                            className="cursor-pointer px-3 py-2 text-sm font-medium text-accent-violet-500 transition-colors duration-150 hover:bg-charcoal-700"
                            onMouseEnter={() => setFocusedIndex(0)}
                            onClick={() =>
                              openAddCategoryForExpense(
                                e.id,
                                searchQuery.trim()
                              )
                            }
                          >
                            Create new
                          </li>
                          {filteredCategories.map((c, idx) => {
                            const optionIndex = idx + 1;
                            const isFocused = focusedIndex === optionIndex;
                            return (
                              <li
                                key={c.id}
                                role="option"
                                aria-selected={isFocused}
                                className={`cursor-pointer px-3 py-2 text-sm transition-colors duration-150 ${
                                  isFocused
                                    ? "bg-charcoal-700"
                                    : "text-charcoal-200 hover:bg-charcoal-700"
                                } ${
                                  categorySuper.get(c.id) === "needs"
                                    ? "text-needs"
                                    : categorySuper.get(c.id) === "wants"
                                      ? "text-wants"
                                      : ""
                                }`}
                                onMouseEnter={() =>
                                  setFocusedIndex(optionIndex)
                                }
                                onClick={() => {
                                  handleCategoryChange(e.id, c.id);
                                  setOpenComboboxExpenseId(null);
                                }}
                              >
                                {c.name}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  );
                })()}
                {(e.category_id ?? miscCategoryId) !== miscCategoryId &&
                  e.category_id != null &&
                  userAddedCategoryIds.has(e.category_id) && (
                  <button
                    type="button"
                    onClick={() =>
                      openDeleteConfirm(e.category_id ?? miscCategoryId)
                    }
                    aria-label="Remove category"
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-accent-rose-500 bg-charcoal-800/80 text-accent-rose-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-charcoal-700 focus:outline-none focus:ring-2 focus:ring-accent-rose-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
                  >
                    <span className="text-xs font-medium leading-none">−</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={
                  categorySuper.get(e.category_id ?? miscCategoryId) === "needs"
                    ? "font-medium text-needs"
                    : categorySuper.get(e.category_id ?? miscCategoryId) ===
                        "wants"
                      ? "font-medium text-wants"
                      : "font-medium text-white"
                }
              >
                {formatCurrency(Number(e.amount))}
              </span>
              <button
                type="button"
                onClick={() => handleDeleteExpense(e.id)}
                disabled={deletingExpenseId === e.id}
                aria-label={`Delete expense ${e.description}`}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-accent-rose-500 bg-charcoal-800/80 text-accent-rose-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-charcoal-700 focus:outline-none focus:ring-2 focus:ring-accent-rose-500 focus:ring-offset-2 focus:ring-offset-charcoal-900 disabled:opacity-50"
              >
                <span className="text-xs font-medium leading-none">×</span>
              </button>
            </div>
          </li>
          );
        })}
      </ul>

      {showAddCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          aria-labelledby="add-category-title"
          onClick={() => {
            setShowAddCategory(false);
            setAddError(null);
            setExpenseIdForNewCategory(null);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-charcoal-500 bg-charcoal-900 p-6 shadow-xl"
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
                  className="mb-1 block text-xs font-medium uppercase tracking-widest text-charcoal-400"
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
                  className="w-full rounded-xl border border-charcoal-500 bg-charcoal-900/80 px-4 py-3 text-white placeholder-charcoal-300 focus:border-charcoal-400 focus:outline-none focus:ring-1 focus:ring-accent-violet-500"
                />
              </div>
              <div>
                <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-charcoal-400">
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
                    setExpenseIdForNewCategory(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addPending}
                  className="flex-1 rounded-lg border border-accent-violet-500 bg-charcoal-800 px-3 py-2 text-sm font-medium text-accent-violet-500 transition-colors hover:bg-charcoal-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          aria-labelledby="delete-category-title"
          onClick={() => {
            setDeleteConfirmCategoryId(null);
            setDeleteError(null);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-charcoal-500 bg-charcoal-900 p-6 shadow-xl"
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
                className="btn-secondary flex-1"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletePending}
                className="flex-1 rounded-lg border-2 border-accent-rose-500 bg-transparent px-3 py-2 text-sm font-medium text-accent-rose-500 transition-colors hover:bg-charcoal-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent-rose-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
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
