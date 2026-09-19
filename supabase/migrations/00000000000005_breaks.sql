-- breaks: paid/unpaid breaks taken during a shift.

create table public.breaks (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references public.shifts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  is_paid boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  constraint breaks_order_check check (ended_at is null or ended_at > started_at)
);

comment on table public.breaks is 'A single break taken during a shift.';

create index breaks_shift_id_idx on public.breaks (shift_id);
create index breaks_user_id_idx on public.breaks (user_id);

-- A shift can only have one open (still-running) break at a time.
create unique index breaks_one_open_per_shift_idx
  on public.breaks (shift_id)
  where (ended_at is null);

alter table public.breaks enable row level security;

create policy "breaks_select_own" on public.breaks for select using (auth.uid() = user_id);
create policy "breaks_insert_own" on public.breaks for insert with check (auth.uid() = user_id);
create policy "breaks_update_own" on public.breaks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "breaks_delete_own" on public.breaks for delete using (auth.uid() = user_id);
