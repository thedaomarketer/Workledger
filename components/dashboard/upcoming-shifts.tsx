import { CalendarClock } from "lucide-react";

import { formatDate, formatTime } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UpcomingShift {
  id: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  job: { name: string; color: string } | null;
}

export async function UpcomingShifts({ shifts, timezone }: { shifts: UpcomingShift[]; timezone: string }) {
  const { intl, m } = await getI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{m.dashboard.upcoming}</CardTitle>
      </CardHeader>
      <CardContent>
        {shifts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{m.dashboard.noUpcoming}</p>
        ) : (
          <ul className="space-y-3">
            {shifts.map((shift) => (
              <li key={shift.id} className="flex items-center gap-3 text-sm">
                <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{shift.job?.name ?? m.dashboard.shift}</p>
                  {shift.scheduled_start && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(shift.scheduled_start, timezone, intl)} · {formatTime(shift.scheduled_start, timezone, intl)}
                      {shift.scheduled_end ? ` – ${formatTime(shift.scheduled_end, timezone, intl)}` : ""}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
