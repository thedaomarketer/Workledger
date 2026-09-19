-- jobs: the employers / gigs a user tracks work against.

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  company_name text,
  job_title text,
  description text,
  hourly_rate numeric(12, 2),
  overtime_rate numeric(12, 2),
  overtime_threshold_minutes integer,
  start_date date,
  end_date date,
  is_active boolean not null default true,
  color text not null default '#2563eb',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_dates_check check (end_date is null or start_date is null or end_date >= start_date)
);

comment on table public.jobs is 'An employer, client, or gig a user logs time and money against.';

create index jobs_user_id_idx on public.jobs (user_id);
create index jobs_active_idx on public.jobs (user_id, is_active);

create trigger set_jobs_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

alter table public.jobs enable row level security;

create policy "jobs_select_own" on public.jobs for select using (auth.uid() = user_id);
create policy "jobs_insert_own" on public.jobs for insert with check (auth.uid() = user_id);
create policy "jobs_update_own" on public.jobs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "jobs_delete_own" on public.jobs for delete using (auth.uid() = user_id);
