"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ExpenseInsert } from "@/types/database";

export async function addExpense(budgetId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const description = String(formData.get("description")).trim();
  const amount = Number(formData.get("amount"));
  const paymentLabel = formData.get("payment_label")
    ? String(formData.get("payment_label")).trim()
    : null;

  if (!description) return { error: "Description is required." };
  if (Number.isNaN(amount) || amount < 0) return { error: "Amount must be 0 or more." };

  const { error } = await supabase.from("expenses").insert({
    budget_id: budgetId,
    description,
    amount,
    payment_label: paymentLabel || null,
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
