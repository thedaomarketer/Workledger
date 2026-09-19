-- schedule_entries: forward-looking schedule/calendar items independent of shifts.

create table public.schedule_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'confirmed', 'cancelled', 'time_off')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedule_entries_order_check check (end_at > start_at)
);

comment on table public.schedule_entries is
  'A calendar item (upcoming shift, time-off, etc.) independent of the '
  'shifts table, used to drive the calendar view.';

create index schedule_entries_user_id_idx on public.schedule_entries (user_id);
create index schedule_entries_user_start_idx on public.schedule_entries (user_id, start_at);

create trigger set_schedule_entries_updated_at
  before update on public.schedule_entries
  for each row execute function public.set_updated_at();

alter table public.schedule_entries enable row level security;

create policy "schedule_entries_select_own" on public.schedule_entries for select using (auth.uid() = user_id);
create policy "schedule_entries_insert_own" on public.schedule_entries for insert with check (auth.uid() = user_id);
create policy "schedule_entries_update_own" on public.schedule_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "schedule_entries_delete_own" on public.schedule_entries for delete using (auth.uid() = user_id);
