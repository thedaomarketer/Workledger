"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit/log";
import { preferencesSchema, profileSchema, taxSettingsSchema } from "@/lib/validation/settings";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function updateProfileAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    timezone: formData.get("timezone"),
    currency: formData.get("currency"),
    dateFormat: formData.get("dateFormat"),
    defaultHourlyRate: formData.get("defaultHourlyRate") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid profile details." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      country: parsed.data.country || null,
      timezone: parsed.data.timezone,
      currency: parsed.data.currency.toUpperCase(),
      date_format: parsed.data.dateFormat,
      default_hourly_rate: parsed.data.defaultHourlyRate ?? null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "We couldn't save your profile. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updatePreferencesAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = preferencesSchema.safeParse({
    weekStartsOn: formData.get("weekStartsOn"),
    defaultBreakMinutes: formData.get("defaultBreakMinutes"),
    overtimeEnabled: formData.get("overtimeEnabled"),
    overtimeThresholdHours: formData.get("overtimeThresholdHours"),
    notificationsEnabled: formData.get("notificationsEnabled"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid preferences." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("user_settings")
    .update({
      week_starts_on: parsed.data.weekStartsOn,
      default_break_minutes: parsed.data.defaultBreakMinutes,
      overtime_enabled: parsed.data.overtimeEnabled,
      overtime_threshold_minutes: Math.round(parsed.data.overtimeThresholdHours * 60),
      notifications_enabled: parsed.data.notificationsEnabled,
    })
    .eq("user_id", user.id);

  if (error) {
    return { error: "We couldn't save your preferences. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTaxSettingsAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = taxSettingsSchema.safeParse({
    taxCountry: formData.get("taxCountry"),
    taxRegion: formData.get("taxRegion"),
    taxCity: formData.get("taxCity"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid tax settings." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("user_settings")
    .update({
      tax_country: parsed.data.taxCountry || null,
      tax_region: parsed.data.taxRegion || null,
      tax_city: parsed.data.taxCity || null,
    })
    .eq("user_id", user.id);

  if (error) {
    return { error: "We couldn't save your tax settings. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/taxes");
  return { success: true };
}

export async function deleteAccountAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  await logAudit({ userId: user.id, entityType: "account", entityId: user.id, action: "deleted" });

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return { error: "We couldn't delete your account. Please try again or contact support." };
  }

  await supabase.auth.signOut();
  redirect("/login");
}
