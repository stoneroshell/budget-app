-- Remove payment sources feature: drop table and expenses.payment_label

drop policy if exists "Users can manage own payment sources" on public.payment_sources;
drop table if exists public.payment_sources;

alter table public.expenses drop column if exists payment_label;
