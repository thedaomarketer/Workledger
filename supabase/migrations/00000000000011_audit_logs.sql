-- audit_logs: append-only record of changes to trustworthy/sensitive data.

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  action text not null
    check (action in (
      'created', 'updated', 'deleted',
      'clocked_in', 'clocked_out', 'break_started', 'break_ended'
    )),
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

comment on table public.audit_logs is
  'Append-only audit trail. Rows are written by server-side application '
  'code (never trusted from the client) and are never updated or deleted.';

create index audit_logs_user_id_idx on public.audit_logs (user_id);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_user_created_idx on public.audit_logs (user_id, created_at desc);

alter table public.audit_logs enable row level security;

-- Read-only from the client: rows are written exclusively via the
-- service-role key from trusted server-side code paths.
create policy "audit_logs_select_own" on public.audit_logs for select using (auth.uid() = user_id);
