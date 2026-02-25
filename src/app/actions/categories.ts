"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Category, CategoryInsert } from "@/types/database";

const SUPERCATEGORIES = ["needs", "wants", "misc"] as const;
export type Supercategory = (typeof SUPERCATEGORIES)[number];

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: hidden } = await supabase
    .from("user_hidden_categories")
    .select("category_id")
    .eq("user_id", user.id);
  const hiddenIds = new Set((hidden ?? []).map((r) => r.category_id));

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("supercategory", { ascending: true })
    .order("name", { ascending: true });

  const list = (data ?? []).filter((c) => !hiddenIds.has(c.id));
  return list;
}

export async function getMiscCategoryId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("categories")
    .select("id")
    .eq("name", "Misc")
    .is("user_id", null)
    .limit(1)
    .single();

  return data?.id ?? null;
}

export async function createCategory(
  name: string,
  supercategory: Supercategory
): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const trimmed = name.trim();
  if (!trimmed) return { error: "Category name is required." };
  if (supercategory !== "needs" && supercategory !== "wants")
    return { error: "Custom categories must be Needs or Wants." };

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: trimmed,
      supercategory,
      user_id: user.id,
    } as CategoryInsert)
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }
  return { id: data?.id };
}

export async function deleteOrHideCategory(
  categoryId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: category } = await supabase
    .from("categories")
    .select("id, name, user_id")
    .eq("id", categoryId)
    .single();

  if (!category) return { error: "Category not found." };

  if (category.user_id === null) {
    return { error: "Universal categories cannot be removed." };
  }

  const miscId = await getMiscCategoryId();
  if (!miscId) return { error: "Cannot remove category." };

  if (category.user_id === user.id) {
    const { error: updateErr } = await supabase
      .from("expenses")
      .update({ category_id: miscId })
      .eq("category_id", categoryId);
    if (updateErr) return { error: updateErr.message };

    const { error: deleteErr } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);
    if (deleteErr) return { error: deleteErr.message };
  } else {
    const { error: insertErr } = await supabase
      .from("user_hidden_categories")
      .insert({ user_id: user.id, category_id: categoryId });
    if (insertErr) return { error: insertErr.message };
  }

  return {};
}
