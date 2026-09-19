-- Harden functions flagged by the Supabase security linter:
-- 1. Pin search_path on set_updated_at (was previously unset/mutable).
-- 2. Revoke EXECUTE on handle_new_user from anon/authenticated -- it must
--    only ever run as the auth.users insert trigger, never as a direct RPC.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- EXECUTE is granted to PUBLIC by default in Postgres, which anon and
-- authenticated inherit from -- revoke both explicitly.
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon, authenticated;
