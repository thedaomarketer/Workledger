import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// Full-account data export (Part 40 of the product spec): every table a
// user owns, as a single JSON document they can save.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile, jobs, shifts, breaks, journalEntries, expenses, mileageEntries, scheduleEntries, settings] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("jobs").select("*").eq("user_id", user.id),
      supabase.from("shifts").select("*").eq("user_id", user.id),
      supabase.from("breaks").select("*").eq("user_id", user.id),
      supabase.from("journal_entries").select("*").eq("user_id", user.id),
      supabase.from("expenses").select("*").eq("user_id", user.id),
      supabase.from("mileage_entries").select("*").eq("user_id", user.id),
      supabase.from("schedule_entries").select("*").eq("user_id", user.id),
      supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

  const payload = {
    exported_at: new Date().toISOString(),
    profile: profile.data,
    settings: settings.data,
    jobs: jobs.data ?? [],
    shifts: shifts.data ?? [],
    breaks: breaks.data ?? [],
    journal_entries: journalEntries.data ?? [],
    expenses: expenses.data ?? [],
    mileage_entries: mileageEntries.data ?? [],
    schedule_entries: scheduleEntries.data ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="workledger-export.json"`,
    },
  });
}
