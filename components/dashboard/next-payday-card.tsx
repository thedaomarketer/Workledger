import Link from "next/link";
import { CalendarClock } from "lucide-react";

import type { JobPayday } from "@/lib/data/tax";
import { daysUntil, formatDaysAway, formatLongDate } from "@/lib/format";
import { fmt } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import { Card, CardContent } from "@/components/ui/card";

export async function NextPaydayCard({ payday, timezone }: { payday: JobPayday; timezone: string }) {
  const { intl, m } = await getI18n();

  return (
    <Link href="/taxes">
      <Card className="transition-colors hover:bg-accent/40">
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <CalendarClock className="size-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              {fmt(m.dashboard.nextPayday, {
                date: formatLongDate(payday.nextPayday, timezone, intl),
                job: payday.jobName,
              })}
            </p>
            <p className="text-xs text-muted-foreground">{formatDaysAway(daysUntil(payday.nextPayday), m)}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
