-- User-hidden categories: seed categories the user has "removed" from their list.
create table if not exists public.user_hidden_categories (
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (user_id, category_id)
);

alter table public.user_hidden_categories enable row level security;

create policy "Users can manage own hidden categories"
  on public.user_hidden_categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
