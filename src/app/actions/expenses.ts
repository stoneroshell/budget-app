"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ExpenseInsert } from "@/types/database";
import { getMiscCategoryId } from "@/app/actions/categories";
import { categorizeByDescription } from "@/lib/categorization";

export async function addExpense(budgetId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const description = String(formData.get("description")).trim();
  const amount = Number(formData.get("amount"));

  if (!description) return { error: "Description is required." };
  if (Number.isNaN(amount) || amount < 0) return { error: "Amount must be 0 or more." };

  const suggestedName = categorizeByDescription(description);
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name");
  const match = (categories ?? []).find(
    (c) => c.name.toLowerCase() === suggestedName.toLowerCase()
  );
  const category_id = match?.id ?? (await getMiscCategoryId());

  const { error } = await supabase.from("expenses").insert({
    budget_id: budgetId,
    description,
    amount,
    category_id: category_id,
  } as ExpenseInsert);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${budgetId}`);
  return {};
}

export async function getExpensesByBudgetId(budgetId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: budget } = await supabase
    .from("budgets")
    .select("id")
    .eq("id", budgetId)
    .eq("user_id", user.id)
    .single();

  if (!budget) return [];

  const { data } = await supabase
    .from("expenses")
    .select("*")
    .eq("budget_id", budgetId)
    .order("id", { ascending: true });

  return data ?? [];
}

export async function getExpensesByBudgetIds(budgetIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  if (budgetIds.length === 0) return [];

  const { data: userBudgets } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", user.id)
    .in("id", budgetIds);

  const validIds = (userBudgets ?? []).map((b) => b.id);
  if (validIds.length === 0) return [];

  const { data } = await supabase
    .from("expenses")
    .select("*")
    .in("budget_id", validIds)
    .order("id", { ascending: true });

  return data ?? [];
}

export async function updateExpenseCategory(
  expenseId: string,
  categoryId: string | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: expense } = await supabase
    .from("expenses")
    .select("budget_id")
    .eq("id", expenseId)
    .single();

  if (!expense) return { error: "Expense not found." };

  const { data: budget } = await supabase
    .from("budgets")
    .select("id")
    .eq("id", expense.budget_id)
    .eq("user_id", user.id)
    .single();

  if (!budget) return { error: "Not allowed." };

  const { error } = await supabase
    .from("expenses")
    .update({ category_id: categoryId })
    .eq("id", expenseId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${expense.budget_id}`);
  return {};
}

export async function deleteExpense(expenseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: expense } = await supabase
    .from("expenses")
    .select("budget_id")
    .eq("id", expenseId)
    .single();

  if (!expense) return { error: "Expense not found." };

  const { data: budget } = await supabase
    .from("budgets")
    .select("id")
    .eq("id", expense.budget_id)
    .eq("user_id", user.id)
    .single();

  if (!budget) return { error: "Not allowed." };

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${expense.budget_id}`);
  return {};
}
