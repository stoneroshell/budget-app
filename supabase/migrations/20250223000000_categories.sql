-- Categories: seed (user_id null) + user-created (user_id set). Single table, one list in UI.
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  supercategory text not null check (supercategory in ('needs', 'wants', 'misc')),
  user_id uuid null references auth.users(id) on delete cascade
);

alter table public.categories enable row level security;

-- Read: seed categories + own custom
create policy "Users can view seed and own categories"
  on public.categories for select
  using (user_id is null or user_id = auth.uid());

-- Insert: only custom (user_id must be set)
create policy "Users can insert own categories"
  on public.categories for insert
  with check (user_id = auth.uid());

-- Update/Delete: only own custom (cannot modify seed)
create policy "Users can update own categories"
  on public.categories for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own categories"
  on public.categories for delete
  using (user_id = auth.uid());

-- Expenses FK: category_id references categories; on delete set null
alter table public.expenses
  add constraint expenses_category_id_fkey
  foreign key (category_id) references public.categories(id) on delete set null;

-- Seed categories (user_id null). Misc first; order by supercategory then name for display.
insert into public.categories (name, supercategory, user_id) values
  ('Misc', 'misc', null),
  ('Rent', 'needs', null),
  ('Groceries', 'needs', null),
  ('Utilities', 'needs', null),
  ('Insurance', 'needs', null),
  ('Transportation', 'needs', null),
  ('Gas', 'needs', null),
  ('Restaurants', 'wants', null),
  ('Entertainment', 'wants', null),
  ('Subscriptions', 'wants', null);
