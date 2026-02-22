"use server";

import { createClient } from "@/lib/supabase/server";
import { PAYMENT_SOURCE_COLORS } from "@/lib/payment-source-colors";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PaymentSourceInsert } from "@/types/database";

export async function getPaymentSources() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("payment_sources")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  return data ?? [];
}

export async function createPaymentSource(
  name: string,
  color: string,
  budgetId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const trimmed = name.trim();
  if (!trimmed) return { error: "Source name is required." };
  if (!PAYMENT_SOURCE_COLORS.includes(color as (typeof PAYMENT_SOURCE_COLORS)[number])) {
    return { error: "Invalid color." };
  }

  const { error } = await supabase.from("payment_sources").insert({
    user_id: user.id,
    name: trimmed,
    color,
  } as PaymentSourceInsert);

  if (error) {
    if (error.code === "23505") {
      return { error: "You already have a source with this name." };
    }
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${budgetId}`);
  return {};
}
