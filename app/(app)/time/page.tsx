import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/data/context";
import { getActiveShift, getRecentShiftHistory } from "@/lib/data/shifts";
import { ActiveShiftCard } from "@/components/time/active-shift-card";
import { ClockInCard } from "@/components/time/clock-in-card";
import { ManualShiftDialog } from "@/components/time/manual-shift-dialog";
import { ShiftHistoryTable } from "@/components/time/shift-history-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TimePage() {
  const ctx = await requireUserContext();
  if (!ctx) return null;

  const supabase = await createClient();
  const [{ data: jobs }, activeShift, recentShifts] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, name, color")
      .eq("user_id", ctx.userId)
      .eq("is_active", true)
      .order("name"),
    getActiveShift(ctx.userId),
    getRecentShiftHistory(ctx.userId),
  ]);

  const jobOptions = jobs ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Time</h1>
        <ManualShiftDialog jobs={jobOptions} />
      </div>

      {activeShift ? (
        <ActiveShiftCard
          shift={{
            id: activeShift.id,
            actual_start: activeShift.actual_start!,
            job: activeShift.job,
            breaks: activeShift.breaks,
          }}
          timezone={ctx.timezone}
        />
      ) : (
        <ClockInCard jobs={jobOptions} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shift history</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <ShiftHistoryTable shifts={recentShifts} jobs={jobOptions} timezone={ctx.timezone} />
        </CardContent>
      </Card>
    </div>
  );
}
