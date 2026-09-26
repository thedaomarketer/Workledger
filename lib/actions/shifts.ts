"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { requireUserContext } from "@/lib/data/context";
import { getI18n } from "@/lib/i18n/server";
import { validationMessage } from "@/lib/i18n/validation";
import { manualShiftSchema } from "@/lib/validation/shifts";
import {
  resolveLocalShiftRange,
  shiftsOverlap,
  validateBreakWithinShift,
  validateShiftTimes,
} from "@/lib/calculations";

export interface ActionResult {
  error?: string;
}

export async function clockInAction(jobId: string): Promise<ActionResult> {
  const { m } = await getI18n();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: m.errors.mustSignIn };

  const { data: existingActive } = await supabase
    .from("shifts")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (existingActive) {
    return { error: m.errors.alreadyClockedIn };
  }

  const { data, error } = await supabase
    .from("shifts")
    .insert({ user_id: user.id, job_id: jobId, actual_start: new Date().toISOString(), status: "active" })
    .select("id")
    .single();

  if (error) {
    return { error: m.errors.clockInFailed };
  }

  await logAudit({ userId: user.id, entityType: "shift", entityId: data.id, action: "clocked_in" });

  revalidatePath("/dashboard");
  revalidatePath("/time");
  return {};
}

export async function clockOutAction(shiftId: string): Promise<ActionResult> {
  const { m } = await getI18n();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: m.errors.mustSignIn };

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
    return { error: m.errors.clockOutFailed };
  }

  await logAudit({ userId: user.id, entityType: "shift", entityId: shiftId, action: "clocked_out" });

  revalidatePath("/dashboard");
  revalidatePath("/time");
  return {};
}

export async function startBreakAction(shiftId: string, isPaid: boolean): Promise<ActionResult> {
  const { m } = await getI18n();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: m.errors.mustSignIn };

  const { data: openBreak } = await supabase
    .from("breaks")
    .select("id")
    .eq("shift_id", shiftId)
    .is("ended_at", null)
    .maybeSingle();

  if (openBreak) {
    return { error: m.errors.alreadyOnBreak };
  }

  const { data, error } = await supabase
    .from("breaks")
    .insert({ shift_id: shiftId, user_id: user.id, started_at: new Date().toISOString(), is_paid: isPaid })
    .select("id")
    .single();

  if (error) {
    return { error: m.errors.breakStartFailed };
  }

  await logAudit({ userId: user.id, entityType: "break", entityId: data.id, action: "break_started" });

  revalidatePath("/dashboard");
  revalidatePath("/time");
  return {};
}

export async function endBreakAction(breakId: string): Promise<ActionResult> {
  const { m } = await getI18n();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: m.errors.mustSignIn };

  const { error } = await supabase
    .from("breaks")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", breakId)
    .eq("user_id", user.id);

  if (error) {
    return { error: m.errors.breakEndFailed };
  }

  await logAudit({ userId: user.id, entityType: "break", entityId: breakId, action: "break_ended" });

  revalidatePath("/dashboard");
  revalidatePath("/time");
  return {};
}

async function overlapsExistingShift(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  start: Date,
  end: Date,
  excludeShiftId?: string
): Promise<boolean> {
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

  return (otherShifts ?? []).some((other) =>
    shiftsOverlap(
      { start, end },
      { start: other.actual_start as string, end: other.actual_end as string | null }
    )
  );
}

function parseShiftForm(formData: FormData) {
  return manualShiftSchema.safeParse({
    jobId: formData.get("jobId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    endDate: formData.get("endDate"),
    breakMinutes: formData.get("breakMinutes") || 0,
    notes: formData.get("notes"),
  });
}

export async function createManualShiftAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { m } = await getI18n();
  const parsed = parseShiftForm(formData);
  if (!parsed.success) return { error: validationMessage(m, parsed.error) };

  const ctx = await requireUserContext();
  if (!ctx) return { error: m.errors.mustSignIn };
  const user = { id: ctx.userId };

  const { jobId, breakMinutes, notes } = parsed.data;
  const { start, end } = resolveLocalShiftRange(
    { ...parsed.data, endDate: parsed.data.endDate || undefined },
    ctx.timezone
  );
  if (validateShiftTimes(start, end)) return { error: m.errors.endBeforeStart };

  const supabase = await createClient();
  if (await overlapsExistingShift(supabase, user.id, start, end)) return { error: m.errors.overlap };

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
    return { error: m.errors.shiftSaveFailed };
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
  const { m } = await getI18n();
  const parsed = parseShiftForm(formData);
  if (!parsed.success) return { error: validationMessage(m, parsed.error) };

  const ctx = await requireUserContext();
  if (!ctx) return { error: m.errors.mustSignIn };
  const user = { id: ctx.userId };

  const { jobId, notes } = parsed.data;
  const { start, end } = resolveLocalShiftRange(
    { ...parsed.data, endDate: parsed.data.endDate || undefined },
    ctx.timezone
  );
  if (validateShiftTimes(start, end)) return { error: m.errors.endBeforeStart };

  const supabase = await createClient();
  if (await overlapsExistingShift(supabase, user.id, start, end, shiftId)) return { error: m.errors.overlap };

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
    return { error: m.errors.shiftUpdateFailed };
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
  const { m } = await getI18n();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: m.errors.mustSignIn };

  const { data: before } = await supabase
    .from("shifts")
    .select("*")
    .eq("id", shiftId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("shifts").delete().eq("id", shiftId).eq("user_id", user.id);

  if (error) {
    return { error: m.errors.shiftDeleteFailed };
  }

  await logAudit({ userId: user.id, entityType: "shift", entityId: shiftId, action: "deleted", oldData: before });

  revalidatePath("/dashboard");
  revalidatePath("/time");
  return {};
}
