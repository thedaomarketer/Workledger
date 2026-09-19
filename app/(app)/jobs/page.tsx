import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/data/context";
import { getCompletedShiftsInRange } from "@/lib/data/shifts";
import { dollarsToCents, formatCents, getWorkweekBounds, summarizeShiftsByJob } from "@/lib/calculations";
import { formatMinutesAsHours } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateJobDialog } from "@/components/jobs/create-job-dialog";
import { JobActionsMenu } from "@/components/jobs/job-actions-menu";

export default async function JobsPage() {
  const ctx = await requireUserContext();
  if (!ctx) return null;

  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", ctx.userId)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false });

  const { start, end } = getWorkweekBounds(new Date(), ctx.timezone, ctx.weekStartsOn);
  const shifts = await getCompletedShiftsInRange(ctx.userId, start, end);

  const jobRates = Object.fromEntries(
    (jobs ?? []).map((job) => [
      job.id,
      {
        hourlyRateCents: job.hourly_rate ? dollarsToCents(job.hourly_rate) : 0,
        overtimeRateCents: job.overtime_rate ? dollarsToCents(job.overtime_rate) : null,
        overtimeThresholdMinutes: job.overtime_threshold_minutes,
      },
    ])
  );

  const summaries = summarizeShiftsByJob(
    shifts
      .filter((s) => s.actual_start)
      .map((s) => ({
        jobId: s.job_id,
        start: s.actual_start!,
        end: s.actual_end,
        breaks: s.breaks.map((b) => ({ startedAt: b.started_at, endedAt: b.ended_at, isPaid: b.is_paid })),
      })),
    jobRates
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
        <CreateJobDialog />
      </div>

      {!jobs || jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            You haven&apos;t added any jobs yet. Add one to start tracking time.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => {
            const summary = summaries[job.id];
            return (
              <Card key={job.id} className={!job.is_active ? "opacity-60" : undefined}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-full" style={{ backgroundColor: job.color }} />
                      <CardTitle className="text-base">
                        <Link href={`/jobs/${job.id}`} className="hover:underline">
                          {job.name}
                        </Link>
                      </CardTitle>
                    </div>
                    <JobActionsMenu jobId={job.id} isActive={job.is_active} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {job.job_title && <p className="text-sm text-muted-foreground">{job.job_title}</p>}
                  {job.hourly_rate != null && (
                    <p className="text-sm">${job.hourly_rate.toFixed(2)}/hour</p>
                  )}
                  <div className="flex items-center justify-between border-t pt-3 text-sm">
                    <span className="text-muted-foreground">This week</span>
                    <span className="font-medium tabular-nums">
                      {summary ? formatMinutesAsHours(summary.paidMinutes) : "0h"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Earnings</span>
                    <span className="font-medium tabular-nums">
                      {summary ? formatCents(summary.earningsCents) : "$0.00"}
                    </span>
                  </div>
                  {!job.is_active && (
                    <Badge variant="secondary" className="w-fit">
                      Archived
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
