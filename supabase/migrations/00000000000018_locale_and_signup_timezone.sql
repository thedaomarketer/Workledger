-- UI language preference, and capturing the user's time zone + language at
-- signup instead of silently defaulting everyone to UTC/English.

alter table public.profiles
  add column locale text not null default 'en' check (locale in ('en', 'fr', 'es'));

comment on column public.profiles.locale is
  'UI language (lib/i18n). Mirrored into the wl-locale cookie so every page renders in it.';

-- A time zone reaches date-fns-tz / Intl on every page render, where an
-- unknown one throws. The app validates on write, but a row could still be
-- edited through the REST API directly (RLS allows a user to update their
-- own profile), so enforce it at the database level too.
create or replace function public.is_valid_time_zone(tz text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (select 1 from pg_catalog.pg_timezone_names where name = tz);
$$;

alter table public.profiles
  add constraint profiles_timezone_valid check (public.is_valid_time_zone(timezone));

-- Signup metadata is client-controlled (anyone holding the public anon key can
-- call auth.signUp directly), so both values are validated here rather than
-- trusted, falling back to the column defaults.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_tz text := new.raw_user_meta_data ->> 'timezone';
  requested_locale text := new.raw_user_meta_data ->> 'locale';
begin
  insert into public.profiles (id, email, full_name, timezone, locale)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    case when requested_tz is not null and public.is_valid_time_zone(requested_tz) then requested_tz else 'UTC' end,
    case when requested_locale in ('en', 'fr', 'es') then requested_locale else 'en' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
