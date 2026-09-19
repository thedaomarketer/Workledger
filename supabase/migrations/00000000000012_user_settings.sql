-- user_settings: per-user preferences that drive calculations and UI.

create table public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  week_starts_on integer not null default 1 check (week_starts_on between 0 and 6),
  default_break_minutes integer not null default 30,
  overtime_enabled boolean not null default false,
  overtime_threshold_minutes integer not null default 2640, -- 44h
  notifications_enabled boolean not null default true,
  dark_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_settings is
  'Per-user preferences. week_starts_on follows JS Date convention: '
  '0 = Sunday .. 6 = Saturday.';

create trigger set_user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

alter table public.user_settings enable row level security;

create policy "user_settings_select_own" on public.user_settings for select using (auth.uid() = user_id);
create policy "user_settings_insert_own" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "user_settings_update_own" on public.user_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_settings_delete_own" on public.user_settings for delete using (auth.uid() = user_id);

-- Extend the new-user trigger to also create a default settings row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;
