-- shifts: scheduled and/or worked periods of time against a job.

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  actual_start timestamptz,
  actual_end timestamptz,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'active', 'completed', 'cancelled', 'missed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shifts_actual_order_check
    check (actual_end is null or actual_start is null or actual_end > actual_start),
  constraint shifts_scheduled_order_check
    check (scheduled_end is null or scheduled_start is null or scheduled_end > scheduled_start)
);

comment on table public.shifts is
  'A period of scheduled and/or worked time. Derived totals (paid minutes, '
  'earnings) are always computed server-side from actual_start/actual_end '
  'and the linked breaks -- never trust a client-calculated total.';

create index shifts_user_id_idx on public.shifts (user_id);
create index shifts_job_id_idx on public.shifts (job_id);
create index shifts_user_actual_start_idx on public.shifts (user_id, actual_start);
create index shifts_user_scheduled_start_idx on public.shifts (user_id, scheduled_start);

-- A user can only have one active (clocked-in) shift at a time. This is the
-- server-side guard against accidental duplicate clock-ins that the product
-- spec requires; the UI validation is a courtesy, not the real guarantee.
create unique index shifts_one_active_per_user_idx
  on public.shifts (user_id)
  where (status = 'active');

create trigger set_shifts_updated_at
  before update on public.shifts
  for each row execute function public.set_updated_at();

alter table public.shifts enable row level security;

create policy "shifts_select_own" on public.shifts for select using (auth.uid() = user_id);
create policy "shifts_insert_own" on public.shifts for insert with check (auth.uid() = user_id);
create policy "shifts_update_own" on public.shifts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "shifts_delete_own" on public.shifts for delete using (auth.uid() = user_id);
