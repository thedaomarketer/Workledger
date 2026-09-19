-- Wrap auth.uid() in (select auth.uid()) across every RLS policy so
-- Postgres evaluates it once per query instead of once per row (Supabase
-- performance linter: auth_rls_initplan). Also add the two missing
-- covering indexes for job_id foreign keys the linter flagged.

alter policy "profiles_select_own" on public.profiles using ((select auth.uid()) = id);
alter policy "profiles_insert_own" on public.profiles with check ((select auth.uid()) = id);
alter policy "profiles_update_own" on public.profiles using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
alter policy "profiles_delete_own" on public.profiles using ((select auth.uid()) = id);

alter policy "jobs_select_own" on public.jobs using ((select auth.uid()) = user_id);
alter policy "jobs_insert_own" on public.jobs with check ((select auth.uid()) = user_id);
alter policy "jobs_update_own" on public.jobs using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "jobs_delete_own" on public.jobs using ((select auth.uid()) = user_id);

alter policy "shifts_select_own" on public.shifts using ((select auth.uid()) = user_id);
alter policy "shifts_insert_own" on public.shifts with check ((select auth.uid()) = user_id);
alter policy "shifts_update_own" on public.shifts using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "shifts_delete_own" on public.shifts using ((select auth.uid()) = user_id);

alter policy "breaks_select_own" on public.breaks using ((select auth.uid()) = user_id);
alter policy "breaks_insert_own" on public.breaks with check ((select auth.uid()) = user_id);
alter policy "breaks_update_own" on public.breaks using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "breaks_delete_own" on public.breaks using ((select auth.uid()) = user_id);

alter policy "journal_entries_select_own" on public.journal_entries using ((select auth.uid()) = user_id);
alter policy "journal_entries_insert_own" on public.journal_entries with check ((select auth.uid()) = user_id);
alter policy "journal_entries_update_own" on public.journal_entries using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "journal_entries_delete_own" on public.journal_entries using ((select auth.uid()) = user_id);

alter policy "expenses_select_own" on public.expenses using ((select auth.uid()) = user_id);
alter policy "expenses_insert_own" on public.expenses with check ((select auth.uid()) = user_id);
alter policy "expenses_update_own" on public.expenses using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "expenses_delete_own" on public.expenses using ((select auth.uid()) = user_id);

alter policy "mileage_entries_select_own" on public.mileage_entries using ((select auth.uid()) = user_id);
alter policy "mileage_entries_insert_own" on public.mileage_entries with check ((select auth.uid()) = user_id);
alter policy "mileage_entries_update_own" on public.mileage_entries using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "mileage_entries_delete_own" on public.mileage_entries using ((select auth.uid()) = user_id);

alter policy "schedule_entries_select_own" on public.schedule_entries using ((select auth.uid()) = user_id);
alter policy "schedule_entries_insert_own" on public.schedule_entries with check ((select auth.uid()) = user_id);
alter policy "schedule_entries_update_own" on public.schedule_entries using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "schedule_entries_delete_own" on public.schedule_entries using ((select auth.uid()) = user_id);

alter policy "attachments_select_own" on public.attachments using ((select auth.uid()) = user_id);
alter policy "attachments_insert_own" on public.attachments with check ((select auth.uid()) = user_id);
alter policy "attachments_update_own" on public.attachments using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "attachments_delete_own" on public.attachments using ((select auth.uid()) = user_id);

alter policy "user_settings_select_own" on public.user_settings using ((select auth.uid()) = user_id);
alter policy "user_settings_insert_own" on public.user_settings with check ((select auth.uid()) = user_id);
alter policy "user_settings_update_own" on public.user_settings using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "user_settings_delete_own" on public.user_settings using ((select auth.uid()) = user_id);

alter policy "ai_conversations_select_own" on public.ai_conversations using ((select auth.uid()) = user_id);
alter policy "ai_conversations_insert_own" on public.ai_conversations with check ((select auth.uid()) = user_id);
alter policy "ai_conversations_update_own" on public.ai_conversations using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "ai_conversations_delete_own" on public.ai_conversations using ((select auth.uid()) = user_id);

alter policy "ai_messages_select_own" on public.ai_messages using ((select auth.uid()) = user_id);
alter policy "ai_messages_insert_own" on public.ai_messages with check ((select auth.uid()) = user_id);
alter policy "ai_messages_update_own" on public.ai_messages using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "ai_messages_delete_own" on public.ai_messages using ((select auth.uid()) = user_id);

alter policy "audit_logs_select_own" on public.audit_logs using ((select auth.uid()) = user_id);

create index journal_entries_job_id_idx on public.journal_entries (job_id);
create index schedule_entries_job_id_idx on public.schedule_entries (job_id);
