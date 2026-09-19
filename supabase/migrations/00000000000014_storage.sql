-- Private storage bucket for receipts and other attachments. Files are
-- stored under `${auth.uid()}/...` and only ever served via short-lived
-- signed URLs generated server-side -- never a public URL.

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy "attachments_storage_select_own"
  on storage.objects for select
  using (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "attachments_storage_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "attachments_storage_update_own"
  on storage.objects for update
  using (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "attachments_storage_delete_own"
  on storage.objects for delete
  using (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);
