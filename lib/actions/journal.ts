"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { journalEntrySchema } from "@/lib/validation/journal";
import type { EntryType } from "@/lib/supabase/database.types";

export interface ActionResult {
  error?: string;
}

export async function createJournalEntryAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = journalEntrySchema.safeParse({
    entryType: formData.get("entryType"),
    jobId: formData.get("jobId"),
    title: formData.get("title"),
    content: formData.get("content"),
    eventAt: formData.get("eventAt"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid entry." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: user.id,
      job_id: parsed.data.jobId || null,
      entry_type: parsed.data.entryType as EntryType,
      title: parsed.data.title || null,
      content: parsed.data.content || null,
      event_at: new Date(parsed.data.eventAt).toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    return { error: "We couldn't save this entry. Please try again." };
  }

  await logAudit({ userId: user.id, entityType: "journal_entry", entityId: data.id, action: "created" });

  revalidatePath("/journal");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteJournalEntryAction(entryId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: before } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("journal_entries").delete().eq("id", entryId).eq("user_id", user.id);
  if (error) return { error: "We couldn't delete this entry." };

  await logAudit({
    userId: user.id,
    entityType: "journal_entry",
    entityId: entryId,
    action: "deleted",
    oldData: before,
  });

  revalidatePath("/journal");
  revalidatePath("/dashboard");
  return {};
}
