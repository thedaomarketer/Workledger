-- mileage_entries: work-related driving a user wants to track/reimburse.

create table public.mileage_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete set null,
  date date not null default current_date,
  start_location text,
  end_location text,
  distance numeric(12, 2) not null check (distance >= 0),
  unit text not null default 'km' check (unit in ('km', 'mi')),
  rate numeric(12, 4) not null default 0,
  reimbursement numeric(12, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.mileage_entries is 'A single work-related trip logged for reimbursement.';

create index mileage_entries_user_id_idx on public.mileage_entries (user_id);
create index mileage_entries_user_date_idx on public.mileage_entries (user_id, date);
create index mileage_entries_job_id_idx on public.mileage_entries (job_id);

create trigger set_mileage_entries_updated_at
  before update on public.mileage_entries
  for each row execute function public.set_updated_at();

alter table public.mileage_entries enable row level security;

create policy "mileage_entries_select_own" on public.mileage_entries for select using (auth.uid() = user_id);
create policy "mileage_entries_insert_own" on public.mileage_entries for insert with check (auth.uid() = user_id);
create policy "mileage_entries_update_own" on public.mileage_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mileage_entries_delete_own" on public.mileage_entries for delete using (auth.uid() = user_id);
