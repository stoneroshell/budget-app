"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Budget, BudgetInsert } from "@/types/database";

export async function createBudget(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const month = Number(formData.get("month"));
  const year = Number(formData.get("year"));
  const income = Number(formData.get("income"));

  if (
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2100 ||
    Number.isNaN(income) ||
    income < 0
  ) {
    return { error: "Invalid month, year, or income." };
  }

  const { data, error } = await supabase
    .from("budgets")
    .insert({
      user_id: user.id,
      month,
      year,
      income,
    } as BudgetInsert)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "You already have a budget for this month." };
    }
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/${data.id}`);
}

export async function getBudgets() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  return data ?? [];
}

export type BudgetWithNetIncome = Budget & { netIncome: number };

export async function getBudgetsWithNetIncome(): Promise<BudgetWithNetIncome[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: budgets } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (!budgets?.length) return [];

  const budgetIds = budgets.map((b) => b.id);
  const { data: expenses } = await supabase
    .from("expenses")
    .select("budget_id, amount")
    .in("budget_id", budgetIds);

  const totalByBudgetId: Record<string, number> = {};
  for (const e of expenses ?? []) {
    const id = e.budget_id;
    totalByBudgetId[id] = (totalByBudgetId[id] ?? 0) + Number(e.amount);
  }

  return budgets.map((b) => ({
    ...b,
    netIncome: Number(b.income) - (totalByBudgetId[b.id] ?? 0),
  }));
}

export async function getBudgetById(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("budgets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  return data;
}

export async function updateBudgetIncome(id: string, income: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (Number.isNaN(income) || income < 0) return { error: "Invalid income." };

  const { error } = await supabase
    .from("budgets")
    .update({ income })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${id}`);
  return {};
}
