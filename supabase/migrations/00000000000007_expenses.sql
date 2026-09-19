-- expenses: work-related spending a user wants to track/reimburse.

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete set null,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'CAD',
  category text not null default 'other'
    check (category in ('meals', 'transport', 'supplies', 'equipment', 'lodging', 'other')),
  description text,
  expense_date date not null default current_date,
  receipt_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.expenses is 'A single work-related expense.';

create index expenses_user_id_idx on public.expenses (user_id);
create index expenses_user_date_idx on public.expenses (user_id, expense_date);
create index expenses_job_id_idx on public.expenses (job_id);

create trigger set_expenses_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

alter table public.expenses enable row level security;

create policy "expenses_select_own" on public.expenses for select using (auth.uid() = user_id);
create policy "expenses_insert_own" on public.expenses for insert with check (auth.uid() = user_id);
create policy "expenses_update_own" on public.expenses for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "expenses_delete_own" on public.expenses for delete using (auth.uid() = user_id);
