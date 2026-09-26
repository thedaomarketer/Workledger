import { CalendarClock } from "lucide-react";

import type { JobPayday } from "@/lib/data/tax";
import { daysUntil, formatDaysAway, formatLongDate } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function PaydayCard({ paydays, timezone }: { paydays: JobPayday[]; timezone: string }) {
  const { intl, m } = await getI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="size-4" /> {m.taxes.upcomingPaydays}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {paydays.length === 0 ? (
          <p className="text-sm text-muted-foreground">{m.taxes.noPaydays}</p>
        ) : (
          <ul className="space-y-3">
            {paydays.map((payday) => (
              <li key={payday.jobId} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: payday.color }} />
                  <span className="truncate text-sm font-medium">{payday.jobName}</span>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium">{formatLongDate(payday.nextPayday, timezone, intl)}</p>
                  <p className="text-xs text-muted-foreground">{formatDaysAway(daysUntil(payday.nextPayday), m)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
