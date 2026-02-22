-- Payment sources: user-defined names + colors for the expense source dropdown
create table if not exists public.payment_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz default now() not null,
  unique (user_id, name)
);

alter table public.payment_sources enable row level security;

create policy "Users can manage own payment sources"
  on public.payment_sources for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
