"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Category } from "@/types/database";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("supercategory", { ascending: true })
    .order("name", { ascending: true });

  return data ?? [];
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
