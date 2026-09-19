"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { manualShiftSchema } from "@/lib/validation/shifts";
import { shiftsOverlap, validateBreakWithinShift, validateShiftTimes } from "@/lib/calculations";

export interface ActionResult {
  error?: string;
}

export async function clockInAction(jobId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: existingActive } = await supabase
    .from("shifts")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (existingActive) {
    return { error: "You're already clocked in on another shift. Clock out first." };
  }

  const { data, error } = await supabase
    .from("shifts")
    .insert({ user_id: user.id, job_id: jobId, actual_start: new Date().toISOString(), status: "active" })
    .select("id")
    .single();

  if (error) {
    return { error: "We couldn't clock you in. Please try again." };
  }

  await logAudit({ userId: user.id, entityType: "shift", entityId: data.id, action: "clocked_in" });

  revalidatePath("/dashboard");
  revalidatePath("/time");
  return {};
}

export async function clockOutAction(shiftId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const now = new Date().toISOString();

  // Close out any still-open break first so stored data matches what the
  // calculation engine will report.
  await supabase
    .from("breaks")
    .update({ ended_at: now })
    .eq("shift_id", shiftId)
    .eq("user_id", user.id)
    .is("ended_at", null);

  const { error } = await supabase
    .from("shifts")
    .update({ actual_end: now, status: "completed" })
    .eq("id", shiftId)
    .eq("user_id", user.id)
    .eq("status", "active");

  if (error) {
    return { error: "We couldn't clock you out. Please try again." };
  }

  await logAudit({ userId: user.id, entityType: "shift", entityId: shiftId, action: "clocked_out" });

  revalidatePath("/dashboard");
  revalidatePath("/time");
  return {};
}

export async function startBreakAction(shiftId: string, isPaid: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: openBreak } = await supabase
    .from("breaks")
    .select("id")
    .eq("shift_id", shiftId)
    .is("ended_at", null)
    .maybeSingle();

  if (openBreak) {
    return { error: "You're already on a break." };
  }

  const { data, error } = await supabase
    .from("breaks")
    .insert({ shift_id: shiftId, user_id: user.id, started_at: new Date().toISOString(), is_paid: isPaid })
    .select("id")
    .single();

  if (error) {
    return { error: "We couldn't start your break. Please try again." };
  }

  await logAudit({ userId: user.id, entityType: "break", entityId: data.id, action: "break_started" });

  revalidatePath("/dashboard");
  revalidatePath("/time");
  return {};
}

export async function endBreakAction(breakId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("breaks")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", breakId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "We couldn't end your break. Please try again." };
  }

  await logAudit({ userId: user.id, entityType: "break", entityId: breakId, action: "break_ended" });

  revalidatePath("/dashboard");
  revalidatePath("/time");
  return {};
}

async function checkOverlap(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  start: Date,
  end: Date,
  excludeShiftId?: string
): Promise<string | null> {
  let query = supabase
    .from("shifts")
    .select("id, actual_start, actual_end")
    .eq("user_id", userId)
    .not("actual_start", "is", null)
    .neq("status", "cancelled");

  if (excludeShiftId) {
    query = query.neq("id", excludeShiftId);
  }

  const { data: otherShifts } = await query;

  const overlap = (otherShifts ?? []).some((other) =>
    shiftsOverlap(
      { start, end },
      { start: other.actual_start as string, end: other.actual_end as string | null }
    )
  );

  return overlap ? "This overlaps with another shift you already have recorded." : null;
}

export async function createManualShiftAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = manualShiftSchema.safeParse({
    jobId: formData.get("jobId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    endDate: formData.get("endDate"),
    breakMinutes: formData.get("breakMinutes") || 0,
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid shift details." };
  }

  const { start, end, jobId, breakMinutes, notes } = parsed.data;

  const timeError = validateShiftTimes(start, end);
  if (timeError) return { error: timeError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const overlapError = await checkOverlap(supabase, user.id, start, end);
  if (overlapError) return { error: overlapError };

  const { data: shift, error } = await supabase
    .from("shifts")
    .insert({
      user_id: user.id,
      job_id: jobId,
      actual_start: start.toISOString(),
      actual_end: end.toISOString(),
      status: "completed",
      notes: notes || null,
    })
    .select("id")
    .single();

  if (error || !shift) {
    return { error: "We couldn't save this shift. Please try again." };
  }

  if (breakMinutes > 0) {
    const breakStart = new Date(start.getTime() + 60_000);
    const breakEnd = new Date(breakStart.getTime() + breakMinutes * 60_000);
    const breakTimeError = validateBreakWithinShift(
      { startedAt: breakStart, endedAt: breakEnd },
      { start, end }
    );
    if (!breakTimeError) {
      await supabase.from("breaks").insert({
        shift_id: shift.id,
        user_id: user.id,
        started_at: breakStart.toISOString(),
        ended_at: breakEnd.toISOString(),
        is_paid: false,
      });
    }
  }

  await logAudit({ userId: user.id, entityType: "shift", entityId: shift.id, action: "created" });

  revalidatePath("/dashboard");
  revalidatePath("/time");
  return {};
}

export async function updateManualShiftAction(
  shiftId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = manualShiftSchema.safeParse({
    jobId: formData.get("jobId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    endDate: formData.get("endDate"),
    breakMinutes: formData.get("breakMinutes") || 0,
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid shift details." };
  }

  const { start, end, jobId, notes } = parsed.data;

  const timeError = validateShiftTimes(start, end);
  if (timeError) return { error: timeError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const overlapError = await checkOverlap(supabase, user.id, start, end, shiftId);
  if (overlapError) return { error: overlapError };

  const { data: before } = await supabase
    .from("shifts")
    .select("*")
    .eq("id", shiftId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("shifts")
    .update({
      job_id: jobId,
      actual_start: start.toISOString(),
      actual_end: end.toISOString(),
      notes: notes || null,
    })
    .eq("id", shiftId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "We couldn't update this shift. Please try again." };
  }

  await logAudit({
    userId: user.id,
    entityType: "shift",
    entityId: shiftId,
    action: "updated",
    oldData: before,
    newData: { actual_start: start.toISOString(), actual_end: end.toISOString(), job_id: jobId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/time");
  return {};
}

export async function deleteShiftAction(shiftId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: before } = await supabase
    .from("shifts")
    .select("*")
    .eq("id", shiftId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("shifts").delete().eq("id", shiftId).eq("user_id", user.id);

  if (error) {
    return { error: "We couldn't delete this shift. Please try again." };
  }

  await logAudit({ userId: user.id, entityType: "shift", entityId: shiftId, action: "deleted", oldData: before });

  revalidatePath("/dashboard");
  revalidatePath("/time");
  return {};
}
