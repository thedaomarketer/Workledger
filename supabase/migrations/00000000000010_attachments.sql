-- attachments: metadata for files stored in Supabase Storage, polymorphically
-- attached to any user-owned record (shift, journal entry, expense, etc.).

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entity_type text not null
    check (entity_type in ('shift', 'journal_entry', 'expense', 'mileage_entry', 'job')),
  entity_id uuid not null,
  file_name text not null,
  storage_path text not null unique,
  mime_type text,
  file_size integer,
  created_at timestamptz not null default now()
);

comment on table public.attachments is
  'Metadata for a file in the private "attachments" Storage bucket. Never '
  'expose storage_path directly to clients as a public URL -- always issue '
  'a short-lived signed URL server-side.';

create index attachments_user_id_idx on public.attachments (user_id);
create index attachments_entity_idx on public.attachments (entity_type, entity_id);

alter table public.attachments enable row level security;

create policy "attachments_select_own" on public.attachments for select using (auth.uid() = user_id);
create policy "attachments_insert_own" on public.attachments for insert with check (auth.uid() = user_id);
create policy "attachments_update_own" on public.attachments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "attachments_delete_own" on public.attachments for delete using (auth.uid() = user_id);
