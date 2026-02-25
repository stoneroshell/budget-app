-- Import log: one row per budget that received rows from a CSV import (no file storage).
create table if not exists public.import_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  budget_id uuid not null references public.budgets(id) on delete cascade,
  row_count int not null check (row_count >= 0),
  filename text null,
  created_at timestamptz default now() not null
);

alter table public.import_log enable row level security;

create policy "Users can view own import log"
  on public.import_log for select
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.budgets b
      where b.id = import_log.budget_id and b.user_id = auth.uid()
    )
  );

create policy "Users can insert own import log"
  on public.import_log for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.budgets b
      where b.id = import_log.budget_id and b.user_id = auth.uid()
    )
  );
