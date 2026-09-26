import { CheckCircle2, MessageSquare } from "lucide-react";

import { formatDateTime } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { journalTypeLabel } from "@/components/journal/entry-type-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JournalEntry {
  id: string;
  entry_type: string;
  title: string | null;
  content: string | null;
  event_at: string;
  job: { name: string; color: string } | null;
}

interface CompletedShift {
  id: string;
  actual_start: string | null;
  actual_end: string | null;
  job: { name: string; color: string } | null;
}

type ActivityItem =
  | { kind: "journal"; at: string; entry: JournalEntry }
  | { kind: "shift"; at: string; shift: CompletedShift };

export async function RecentActivity({
  journalEntries,
  completedShifts,
  timezone,
}: {
  journalEntries: JournalEntry[];
  completedShifts: CompletedShift[];
  timezone: string;
}) {
  const { intl, m } = await getI18n();
  const items: ActivityItem[] = [
    ...journalEntries.map((entry): ActivityItem => ({ kind: "journal", at: entry.event_at, entry })),
    ...completedShifts
      .filter((s) => s.actual_end)
      .map((shift): ActivityItem => ({ kind: "shift", at: shift.actual_end!, shift })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{m.dashboard.recentActivity}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{m.dashboard.nothingRecorded}</p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={`${item.kind}-${item.kind === "journal" ? item.entry.id : item.shift.id}`} className="flex gap-3 text-sm">
                {item.kind === "journal" ? (
                  <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {item.kind === "journal"
                      ? item.entry.title || journalTypeLabel(item.entry.entry_type, m)
                      : `${m.dashboard.completedShift}${item.shift.job ? ` · ${item.shift.job.name}` : ""}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(item.at, timezone, intl)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

