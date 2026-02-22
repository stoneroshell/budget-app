-- Profiles: mirrors auth.users for RLS; create on signup via trigger or app
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now() not null
);

-- Budgets: one per user per month/year
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month smallint not null check (month >= 1 and month <= 12),
  year smallint not null,
  income numeric(12, 2) not null check (income >= 0),
  created_at timestamptz default now() not null,
  unique (user_id, month, year)
);

-- Expenses: no date/created_at; category_id nullable for Phase 1
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  description text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  category_id uuid null,
  payment_label text null
);

-- RLS
alter table public.profiles enable row level security;
alter table public.budgets enable row level security;
alter table public.expenses enable row level security;

-- Profiles: users can read/update own row
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Budgets: CRUD only for own user_id
create policy "Users can manage own budgets"
  on public.budgets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Expenses: CRUD only when budget belongs to user
create policy "Users can manage expenses for own budgets"
  on public.expenses for all
  using (
    exists (
      select 1 from public.budgets b
      where b.id = expenses.budget_id and b.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.budgets b
      where b.id = expenses.budget_id and b.user_id = auth.uid()
    )
  );

-- Optional: create profile on signup (Supabase Auth hook or trigger)
-- Here we use a trigger on auth.users.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
