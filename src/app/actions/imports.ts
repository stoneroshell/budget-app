"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ExpenseInsert, ImportLogInsert } from "@/types/database";
import { getMiscCategoryId } from "@/app/actions/categories";

export type CsvImportRow = {
  month: number;
  year: number;
  description: string;
  amount: number;
  category_id: string | null;
};

export async function importExpensesFromCsv(
  rows: CsvImportRow[],
  filename?: string
): Promise<{ error?: string; imported?: number; skippedNoBudget?: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const miscCategoryId = await getMiscCategoryId();

  const { data: budgets } = await supabase
    .from("budgets")
    .select("id, month, year")
    .eq("user_id", user.id);

  const budgetKey = (m: number, y: number) => `${m},${y}`;
  const budgetMap = new Map<string, string>();
  for (const b of budgets ?? []) {
    budgetMap.set(budgetKey(b.month, b.year), b.id);
  }

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
    ) {
      continue;
    }
    if (!row.description?.trim()) continue;
    if (typeof row.amount !== "number" || Number.isNaN(row.amount) || row.amount < 0) continue;

    const budgetId = budgetMap.get(budgetKey(row.month, row.year));
    if (!budgetId) {
      skippedNoBudget++;
      continue;
    }

    const category_id = row.category_id ?? miscCategoryId;
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
      ...(skippedNoBudget > 0
        ? {}
        : { error: "No valid rows to import." }),
    };
  }

  const byBudget = new Map<string, typeof validRows>();
  for (const r of validRows) {
    const list = byBudget.get(r.budget_id) ?? [];
    list.push(r);
    byBudget.set(r.budget_id, list);
  }

  for (const [budgetId, group] of byBudget) {
    const payload: ExpenseInsert[] = group.map((r) => ({
      budget_id: budgetId,
      description: r.description,
      amount: r.amount,
      category_id: r.category_id,
    }));

    const { error: insertError } = await supabase.from("expenses").insert(payload);
    if (insertError) {
      return { error: insertError.message };
    }

    const logRow: ImportLogInsert = {
      user_id: user.id,
      budget_id: budgetId,
      row_count: group.length,
      filename: filename ?? null,
    };
    const { error: logError } = await supabase.from("import_log").insert(logRow);
    if (logError) {
      return { error: logError.message };
    }
  }

  revalidatePath("/dashboard");
  for (const budgetId of byBudget.keys()) {
    revalidatePath(`/dashboard/${budgetId}`);
  }

  return {
    imported: validRows.length,
    skippedNoBudget: skippedNoBudget > 0 ? skippedNoBudget : undefined,
  };
}
