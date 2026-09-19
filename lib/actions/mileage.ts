"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { mileageEntrySchema } from "@/lib/validation/mileage";

export interface ActionResult {
  error?: string;
}

export async function createMileageEntryAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = mileageEntrySchema.safeParse({
    jobId: formData.get("jobId"),
    date: formData.get("date"),
    startLocation: formData.get("startLocation"),
    endLocation: formData.get("endLocation"),
    distance: formData.get("distance"),
    unit: formData.get("unit") || "km",
    rate: formData.get("rate") || 0,
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid mileage entry." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const reimbursement = Math.round(parsed.data.distance * parsed.data.rate * 100) / 100;

  const { data, error } = await supabase
    .from("mileage_entries")
    .insert({
      user_id: user.id,
      job_id: parsed.data.jobId || null,
      date: parsed.data.date,
      start_location: parsed.data.startLocation || null,
      end_location: parsed.data.endLocation || null,
      distance: parsed.data.distance,
      unit: parsed.data.unit,
      rate: parsed.data.rate,
      reimbursement,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "We couldn't save this trip. Please try again." };
  }

  await logAudit({ userId: user.id, entityType: "mileage_entry", entityId: data.id, action: "created" });

  revalidatePath("/mileage");
  revalidatePath("/reports");
  return {};
}

export async function deleteMileageEntryAction(entryId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: before } = await supabase
    .from("mileage_entries")
    .select("*")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("mileage_entries").delete().eq("id", entryId).eq("user_id", user.id);
  if (error) return { error: "We couldn't delete this trip." };

  await logAudit({
    userId: user.id,
    entityType: "mileage_entry",
    entityId: entryId,
    action: "deleted",
    oldData: before,
  });

  revalidatePath("/mileage");
  revalidatePath("/reports");
  return {};
}
