"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteJournalEntryAction } from "@/lib/actions/journal";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ENTRY_TYPE_CONFIG } from "./entry-type-config";
import type { EntryType } from "@/lib/supabase/database.types";

export interface JournalEntryRow {
  id: string;
  entry_type: EntryType;
  title: string | null;
  content: string | null;
  event_at: string;
  job: { name: string; color: string } | null;
}

export function JournalTimeline({ entries, timezone }: { entries: JournalEntryRow[]; timezone: string }) {
  const [isPending, startTransition] = useTransition();

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No journal entries yet. Log a note, task, or incident to build your Work Evidence Timeline.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const config = ENTRY_TYPE_CONFIG[entry.entry_type];
        const Icon = config.icon;
        return (
          <Card key={entry.id}>
            <CardContent className="flex items-start gap-3 py-4">
              <Icon className={`mt-0.5 size-5 shrink-0 ${config.className}`} />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{entry.title || config.label}</p>
                  <Badge variant="outline">{config.label}</Badge>
                  {entry.job && <Badge style={{ backgroundColor: entry.job.color, color: "white" }}>{entry.job.name}</Badge>}
                </div>
                {entry.content && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.content}</p>}
                <p className="text-xs text-muted-foreground">{formatDateTime(entry.event_at, timezone)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await deleteJournalEntryAction(entry.id);
                    if (result.error) toast.error(result.error);
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
