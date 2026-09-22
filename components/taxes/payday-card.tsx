import { CalendarClock } from "lucide-react";

import type { JobPayday } from "@/lib/data/tax";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function daysUntil(date: Date): number {
  const now = new Date();
  return Math.ceil((date.getTime() - now.getTime()) / 86_400_000);
}

function formatPayday(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(date);
}

export function PaydayCard({ paydays }: { paydays: JobPayday[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="size-4" /> Upcoming paydays
        </CardTitle>
      </CardHeader>
      <CardContent>
        {paydays.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add a pay frequency and a known pay date to a job to see your next payday here.
          </p>
        ) : (
          <ul className="space-y-3">
            {paydays.map((payday) => {
              const days = daysUntil(payday.nextPayday);
              return (
                <li key={payday.jobId} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: payday.color }} />
                    <span className="truncate text-sm font-medium">{payday.jobName}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium">{formatPayday(payday.nextPayday)}</p>
                    <p className="text-xs text-muted-foreground">
                      {days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
