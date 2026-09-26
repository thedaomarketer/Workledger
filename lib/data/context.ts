import "server-only";

import { createClient } from "@/lib/supabase/server";
import { safeTimeZone } from "@/lib/timezone";

export interface UserContext {
  userId: string;
  timezone: string;
  weekStartsOn: number;
  currency: string;
}

/** Loads the current user plus the settings needed to run calculations. */
export async function requireUserContext(): Promise<UserContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from("profiles").select("timezone, currency").eq("id", user.id).maybeSingle(),
    supabase.from("user_settings").select("week_starts_on").eq("user_id", user.id).maybeSingle(),
  ]);

  return {
    userId: user.id,
    // Belt and braces: the DB rejects invalid zones, but never let one crash every page.
    timezone: safeTimeZone(profile?.timezone),
    currency: profile?.currency || "USD",
    weekStartsOn: settings?.week_starts_on ?? 1,
  };
}
