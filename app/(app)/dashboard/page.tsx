import { getDashboardData } from "@/lib/data/dashboard";
import { formatCents } from "@/lib/calculations";
import { formatMinutesAsHours as fmtHrs } from "@/lib/format";
import { ActiveShiftCard } from "@/components/time/active-shift-card";
import { ClockInCard } from "@/components/time/clock-in-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { UpcomingShifts } from "@/components/dashboard/upcoming-shifts";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { NextPaydayCard } from "@/components/dashboard/next-payday-card";

export default async function DashboardPage() {
  const data = await getDashboardData();
  if (!data) return null;

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: data.timezone,
  });

  const hour = Number(
    new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: data.timezone }).format(today)
  );
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = data.fullName?.split(" ")[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">{dateLabel}</p>
      </div>

      {data.activeShift ? (
        <ActiveShiftCard
          shift={{
            id: data.activeShift.id,
            actual_start: data.activeShift.actual_start!,
            job: data.activeShift.job,
            breaks: data.activeShift.breaks,
          }}
          timezone={data.timezone}
        />
      ) : (
        <ClockInCard jobs={data.jobs} />
      )}

      {data.nextPayday && <NextPaydayCard payday={data.nextPayday} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Today" value={fmtHrs(data.todayTotals.paidMinutes)} />
        <MetricCard label="This week" value={fmtHrs(data.weekTotals.paidMinutes)} />
        <MetricCard
          label="Overtime"
          value={fmtHrs(data.weekTotals.overtimeMinutes)}
          sub={data.weekTotals.overtimeMinutes > 0 ? "this week" : undefined}
        />
        <MetricCard label="Est. earnings" value={formatCents(data.weekTotals.earningsCents)} sub="this week" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentActivity
          journalEntries={data.journalEntries}
          completedShifts={data.recentCompletedShifts}
          timezone={data.timezone}
        />
        <UpcomingShifts shifts={data.upcomingShifts} timezone={data.timezone} />
      </div>
    </div>
  );
}
