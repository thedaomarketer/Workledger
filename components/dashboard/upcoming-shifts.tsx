import { CalendarClock } from "lucide-react";

import { formatDate, formatTime } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UpcomingShift {
  id: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  job: { name: string; color: string } | null;
}

export function UpcomingShifts({ shifts, timezone }: { shifts: UpcomingShift[]; timezone: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming</CardTitle>
      </CardHeader>
      <CardContent>
        {shifts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No upcoming shifts scheduled.</p>
        ) : (
          <ul className="space-y-3">
            {shifts.map((shift) => (
              <li key={shift.id} className="flex items-center gap-3 text-sm">
                <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{shift.job?.name ?? "Shift"}</p>
                  {shift.scheduled_start && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(shift.scheduled_start, timezone)} · {formatTime(shift.scheduled_start, timezone)}
                      {shift.scheduled_end ? ` – ${formatTime(shift.scheduled_end, timezone)}` : ""}
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
