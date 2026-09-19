-- journal_entries: the Work Evidence Timeline building blocks.

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete set null,
  shift_id uuid references public.shifts (id) on delete set null,
  entry_type text not null default 'general'
    check (entry_type in (
      'general', 'task', 'instruction', 'workplace_issue', 'safety_issue',
      'schedule_change', 'pay_issue', 'break_issue', 'incident', 'other'
    )),
  title text,
  content text,
  event_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.journal_entries is
  'A structured work record (note, task, incident, etc.) tied to an event '
  'time; the source data for the Work Evidence Timeline.';

create index journal_entries_user_id_idx on public.journal_entries (user_id);
create index journal_entries_shift_id_idx on public.journal_entries (shift_id);
create index journal_entries_user_event_at_idx on public.journal_entries (user_id, event_at);

create trigger set_journal_entries_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();

alter table public.journal_entries enable row level security;

create policy "journal_entries_select_own" on public.journal_entries for select using (auth.uid() = user_id);
create policy "journal_entries_insert_own" on public.journal_entries for insert with check (auth.uid() = user_id);
create policy "journal_entries_update_own" on public.journal_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "journal_entries_delete_own" on public.journal_entries for delete using (auth.uid() = user_id);
