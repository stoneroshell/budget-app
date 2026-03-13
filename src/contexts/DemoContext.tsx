"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Budget, Expense, Category } from "@/types/database";
import type { BudgetWithNetIncome } from "@/app/actions/budgets";
import type { CsvImportRow } from "@/app/actions/imports";
import { categorizeByDescription } from "@/lib/categorization";

const STORAGE_KEY = "guap-demo";
const DEMO_USER_ID = "demo";

type DemoStorage = {
  budgets: Budget[];
  expenses: Expense[];
  categories: Category[];
  hiddenCategoryIds: string[];
};

function loadFromStorage(): DemoStorage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as DemoStorage;
    if (!Array.isArray(data.budgets) || !Array.isArray(data.expenses) || !Array.isArray(data.categories)) {
      return null;
    }
    return {
      budgets: data.budgets,
      expenses: data.expenses,
      categories: data.categories,
      hiddenCategoryIds: Array.isArray(data.hiddenCategoryIds) ? data.hiddenCategoryIds : [],
    };
  } catch {
    return null;
  }
}

function persist(storage: DemoStorage) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

async function loadSeed(): Promise<DemoStorage> {
  const res = await fetch("/demo-seed.json");
  if (!res.ok) throw new Error("Failed to load demo seed");
  const data = (await res.json()) as { budgets: Budget[]; expenses: Expense[]; categories: Category[] };
  return {
    budgets: Array.isArray(data.budgets) ? data.budgets : [],
    expenses: Array.isArray(data.expenses) ? data.expenses : [],
    categories: Array.isArray(data.categories) ? data.categories : [],
    hiddenCategoryIds: [],
  };
}

type DemoContextValue = {
  isHydrated: boolean;
  budgets: Budget[];
  expenses: Expense[];
  categories: Category[];
  hiddenCategoryIds: string[];
  getBudgetsWithNetIncome: () => BudgetWithNetIncome[];
  getBudgetById: (id: string) => Budget | null;
  getExpensesByBudgetId: (budgetId: string) => Expense[];
  getExpensesByBudgetIds: (budgetIds: string[]) => Expense[];
  getCategories: () => Category[];
  getMiscCategoryId: () => string | null;
  createBudget: (month: number, year: number, income: number) => { error?: string; id?: string };
  updateBudgetIncome: (id: string, income: number) => { error?: string };
  deleteBudget: (budgetId: string) => { error?: string };
  addExpense: (budgetId: string, formData: FormData) => Promise<{ error?: string }>;
  updateExpenseCategory: (expenseId: string, categoryId: string | null) => { error?: string };
  deleteExpense: (expenseId: string) => { error?: string };
  createCategory: (name: string, supercategory: "needs" | "wants") => Promise<{ error?: string; id?: string }>;
  deleteOrHideCategory: (categoryId: string) => { error?: string };
  importExpensesFromCsv: (rows: CsvImportRow[]) => { error?: string; imported?: number; skippedNoBudget?: number };
  setStorage: (s: DemoStorage) => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [storage, setStorageState] = useState<DemoStorage | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const fromStorage = loadFromStorage();
    if (fromStorage) {
      setStorageState(fromStorage);
      setIsHydrated(true);
      return;
    }
    loadSeed()
      .then((seed) => {
        setStorageState(seed);
        persist(seed);
        setIsHydrated(true);
      })
      .catch(() => {
        setStorageState({
          budgets: [],
          expenses: [],
          categories: [],
          hiddenCategoryIds: [],
        });
        setIsHydrated(true);
      });
  }, []);

  const setStorage = useCallback((next: DemoStorage) => {
    setStorageState(next);
    persist(next);
  }, []);

  const getBudgetsWithNetIncome = useCallback((): BudgetWithNetIncome[] => {
    if (!storage) return [];
    const { budgets, expenses } = storage;
    const sorted = [...budgets].sort((a, b) => (b.year !== a.year ? b.year - a.year : b.month - a.month));
    const totalByBudgetId: Record<string, number> = {};
    for (const e of expenses) {
      totalByBudgetId[e.budget_id] = (totalByBudgetId[e.budget_id] ?? 0) + Number(e.amount);
    }
    return sorted.map((b) => ({
      ...b,
      netIncome: Number(b.income) - (totalByBudgetId[b.id] ?? 0),
    }));
  }, [storage]);

  const getBudgetById = useCallback(
    (id: string): Budget | null => {
      if (!storage) return null;
      return storage.budgets.find((b) => b.id === id) ?? null;
    },
    [storage]
  );

  const getExpensesByBudgetId = useCallback(
    (budgetId: string): Expense[] => {
      if (!storage) return [];
      return storage.expenses.filter((e) => e.budget_id === budgetId).sort((a, b) => (a.id < b.id ? -1 : 1));
    },
    [storage]
  );

  const getExpensesByBudgetIds = useCallback(
    (budgetIds: string[]): Expense[] => {
      if (!storage || budgetIds.length === 0) return [];
      const set = new Set(budgetIds);
      return storage.expenses.filter((e) => set.has(e.budget_id)).sort((a, b) => (a.id < b.id ? -1 : 1));
    },
    [storage]
  );

  const getCategories = useCallback((): Category[] => {
    if (!storage) return [];
    const hidden = new Set(storage.hiddenCategoryIds);
    return storage.categories.filter((c) => !hidden.has(c.id));
  }, [storage]);

  const getMiscCategoryId = useCallback((): string | null => {
    if (!storage) return null;
    const c = storage.categories.find((x) => x.name === "Misc");
    return c?.id ?? null;
  }, [storage]);

  const createBudget = useCallback(
    (month: number, year: number, income: number): { error?: string; id?: string } => {
      if (!storage) return { error: "Demo not loaded." };
      if (month < 1 || month > 12 || year < 2000 || year > 2100 || income < 0) {
        return { error: "Invalid month, year, or income." };
      }
      const exists = storage.budgets.some((b) => b.month === month && b.year === year);
      if (exists) return { error: "You already have a budget for this month." };
      const id = crypto.randomUUID();
      const created_at = new Date().toISOString();
      const newBudget: Budget = {
        id,
        user_id: DEMO_USER_ID,
        month,
        year,
        income,
        created_at,
      };
      const next: DemoStorage = {
        ...storage,
        budgets: [...storage.budgets, newBudget],
      };
      setStorage(next);
      return { id };
    },
    [storage, setStorage]
  );

  const updateBudgetIncome = useCallback(
    (id: string, income: number): { error?: string } => {
      if (!storage) return { error: "Demo not loaded." };
      if (Number.isNaN(income) || income < 0) return { error: "Invalid income." };
      const idx = storage.budgets.findIndex((b) => b.id === id);
      if (idx < 0) return { error: "Budget not found." };
      const next = {
        ...storage,
        budgets: storage.budgets.map((b) => (b.id === id ? { ...b, income } : b)),
      };
      setStorage(next);
      return {};
    },
    [storage, setStorage]
  );

  const deleteBudget = useCallback(
    (budgetId: string): { error?: string } => {
      if (!storage) return { error: "Demo not loaded." };
      const next: DemoStorage = {
        budgets: storage.budgets.filter((b) => b.id !== budgetId),
        expenses: storage.expenses.filter((e) => e.budget_id !== budgetId),
        categories: storage.categories,
        hiddenCategoryIds: storage.hiddenCategoryIds,
      };
      setStorage(next);
      return {};
    },
    [storage, setStorage]
  );

  const addExpense = useCallback(
    async (budgetId: string, formData: FormData): Promise<{ error?: string }> => {
      if (!storage) return { error: "Demo not loaded." };
      const description = String(formData.get("description")).trim();
      const amount = Number(formData.get("amount"));
      if (!description) return { error: "Description is required." };
      if (Number.isNaN(amount) || amount < 0) return { error: "Amount must be 0 or more." };
      const suggestedName = categorizeByDescription(description);
      const match = storage.categories.find((c) => c.name.toLowerCase() === suggestedName.toLowerCase());
      const miscId = storage.categories.find((c) => c.name === "Misc")?.id ?? null;
      const category_id = match?.id ?? miscId;
      const id = crypto.randomUUID();
      const newExpense: Expense = {
        id,
        budget_id: budgetId,
        description,
        amount,
        category_id,
      };
      const next: DemoStorage = {
        ...storage,
        expenses: [...storage.expenses, newExpense],
      };
      setStorage(next);
      return {};
    },
    [storage, setStorage]
  );

  const updateExpenseCategory = useCallback(
    (expenseId: string, categoryId: string | null): { error?: string } => {
      if (!storage) return { error: "Demo not loaded." };
      const next = {
        ...storage,
        expenses: storage.expenses.map((e) => (e.id === expenseId ? { ...e, category_id: categoryId } : e)),
      };
      setStorage(next);
      return {};
    },
    [storage, setStorage]
  );

  const deleteExpense = useCallback(
    (expenseId: string): { error?: string } => {
      if (!storage) return { error: "Demo not loaded." };
      const next = {
        ...storage,
        expenses: storage.expenses.filter((e) => e.id !== expenseId),
      };
      setStorage(next);
      return {};
    },
    [storage, setStorage]
  );

  const createCategory = useCallback(
    async (name: string, supercategory: "needs" | "wants"): Promise<{ error?: string; id?: string }> => {
      if (!storage) return { error: "Demo not loaded." };
      const trimmed = name.trim();
      if (!trimmed) return { error: "Category name is required." };
      const exists = storage.categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
      if (exists) return { error: "A category with that name already exists." };
      const id = crypto.randomUUID();
      const newCat: Category = {
        id,
        name: trimmed,
        supercategory,
        user_id: DEMO_USER_ID,
      };
      const next: DemoStorage = {
        ...storage,
        categories: [...storage.categories, newCat],
      };
      setStorage(next);
      return { id };
    },
    [storage, setStorage]
  );

  const deleteOrHideCategory = useCallback(
    (categoryId: string): { error?: string } => {
      if (!storage) return { error: "Demo not loaded." };
      const cat = storage.categories.find((c) => c.id === categoryId);
      if (!cat) return { error: "Category not found." };
      const miscId = storage.categories.find((c) => c.name === "Misc")?.id ?? null;
      if (!miscId) return { error: "Cannot remove category." };
      if (cat.user_id != null) {
        const next: DemoStorage = {
          ...storage,
          categories: storage.categories.filter((c) => c.id !== categoryId),
          expenses: storage.expenses.map((e) =>
            e.category_id === categoryId ? { ...e, category_id: miscId } : e
          ),
        };
        setStorage(next);
      } else {
        const next: DemoStorage = {
          ...storage,
          hiddenCategoryIds: [...storage.hiddenCategoryIds, categoryId],
        };
        setStorage(next);
      }
      return {};
    },
    [storage, setStorage]
  );

  const importExpensesFromCsv = useCallback(
    (rows: CsvImportRow[]): { error?: string; imported?: number; skippedNoBudget?: number } => {
      if (!storage) return { error: "Demo not loaded." };
      const budgetKey = (m: number, y: number) => `${m},${y}`;
      const budgetMap = new Map<string, string>();
      for (const b of storage.budgets) {
        budgetMap.set(budgetKey(b.month, b.year), b.id);
      }
      const miscId = storage.categories.find((c) => c.name === "Misc")?.id ?? null;
      const validRows: { budget_id: string; description: string; amount: number; category_id: string }[] = [];
      let skippedNoBudget = 0;
      for (const row of rows) {
        if (
          typeof row.month !== "number" ||
          row.month < 1 ||
          row.month > 12 ||
          typeof row.year !== "number" ||
          row.year < 2000 ||
          row.year > 2100
        )
          continue;
        if (!row.description?.trim()) continue;
        if (typeof row.amount !== "number" || Number.isNaN(row.amount) || row.amount < 0) continue;
        const budgetId = budgetMap.get(budgetKey(row.month, row.year));
        if (!budgetId) {
          skippedNoBudget++;
          continue;
        }
        const category_id = row.category_id ?? miscId;
        if (!category_id) continue;
        validRows.push({
          budget_id: budgetId,
          description: row.description.trim(),
          amount: row.amount,
          category_id,
        });
      }
      if (validRows.length === 0) {
        return {
          imported: 0,
          skippedNoBudget,
          ...(skippedNoBudget > 0 ? {} : { error: "No valid rows to import." }),
        };
      }
      const newExpenses: Expense[] = validRows.map((r) => ({
        id: crypto.randomUUID(),
        budget_id: r.budget_id,
        description: r.description,
        amount: r.amount,
        category_id: r.category_id,
      }));
      const next: DemoStorage = {
        ...storage,
        expenses: [...storage.expenses, ...newExpenses],
      };
      setStorage(next);
      return {
        imported: validRows.length,
        skippedNoBudget: skippedNoBudget > 0 ? skippedNoBudget : undefined,
      };
    },
    [storage, setStorage]
  );

  const value = useMemo<DemoContextValue>(
    () => ({
      isHydrated: isHydrated,
      budgets: storage?.budgets ?? [],
      expenses: storage?.expenses ?? [],
      categories: storage?.categories ?? [],
      hiddenCategoryIds: storage?.hiddenCategoryIds ?? [],
      getBudgetsWithNetIncome,
      getBudgetById,
      getExpensesByBudgetId,
      getExpensesByBudgetIds,
      getCategories,
      getMiscCategoryId,
      createBudget,
      updateBudgetIncome,
      deleteBudget,
      addExpense,
      updateExpenseCategory,
      deleteExpense,
      createCategory,
      deleteOrHideCategory,
      importExpensesFromCsv,
      setStorage,
    }),
    [
      isHydrated,
      storage,
      getBudgetsWithNetIncome,
      getBudgetById,
      getExpensesByBudgetId,
      getExpensesByBudgetIds,
      getCategories,
      getMiscCategoryId,
      createBudget,
      updateBudgetIncome,
      deleteBudget,
      addExpense,
      updateExpenseCategory,
      deleteExpense,
      createCategory,
      deleteOrHideCategory,
      importExpensesFromCsv,
      setStorage,
    ]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
