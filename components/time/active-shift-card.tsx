"use client";

import { useEffect, useState, useTransition } from "react";
import { Coffee, Square } from "lucide-react";
import { toast } from "sonner";

import { clockOutAction, endBreakAction, startBreakAction } from "@/lib/actions/shifts";
import { calculateShiftDuration } from "@/lib/calculations";
import { formatHms, formatMinutesAsHours, formatTime } from "@/lib/format";
import { fmt } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BreakRow {
  id: string;
  started_at: string;
  ended_at: string | null;
  is_paid: boolean;
}

export interface ActiveShiftData {
  id: string;
  actual_start: string;
  job: { id: string; name: string; color: string } | null;
  breaks: BreakRow[];
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function ActiveShiftCard({ shift, timezone }: { shift: ActiveShiftData; timezone: string }) {
  const now = useNow();
  const [isPending, startTransition] = useTransition();
  const { locale, intl, m } = useI18n();

  const openBreak = shift.breaks.find((b) => b.ended_at === null);

  const { grossMinutes, paidMinutes } = calculateShiftDuration({
    start: shift.actual_start,
    end: new Date(now),
    breaks: shift.breaks.map((b) => ({ startedAt: b.started_at, endedAt: b.ended_at, isPaid: b.is_paid })),
  });

  const elapsedSeconds = Math.max(0, Math.floor((now - new Date(shift.actual_start).getTime()) / 1000));

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-success" />
            </span>
            {m.time.working}{openBreak ? ` · ${m.time.onBreak}` : ""}
          </CardTitle>
          {shift.job && <Badge style={{ backgroundColor: shift.job.color, color: "white" }}>{shift.job.name}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* The two live counters tick between server render and hydration; that difference is expected. */}
        <div className="grid grid-cols-3 gap-2 text-center sm:gap-4">
          <div>
            <p className="text-[22px] leading-tight font-bold tracking-tight tabular-nums sm:text-[26px]">{formatTime(shift.actual_start, timezone, intl)}</p>
            <p className="text-xs text-muted-foreground">{m.time.started}</p>
          </div>
          <div>
            <p className="text-[22px] leading-tight font-bold tracking-tight tabular-nums sm:text-[26px]" suppressHydrationWarning>
              {formatHms(elapsedSeconds)}
            </p>
            <p className="text-xs text-muted-foreground">{m.time.elapsed}</p>
          </div>
          <div>
            <p className="text-[22px] leading-tight font-bold tracking-tight tabular-nums sm:text-[26px]" suppressHydrationWarning>
              {formatHms(paidMinutes * 60)}
            </p>
            <p className="text-xs text-muted-foreground">{m.time.paid}</p>
          </div>
        </div>
        {grossMinutes !== paidMinutes && (
          <p className="text-center text-xs text-muted-foreground">
            {fmt(m.time.unpaidBreakSoFar, { duration: formatMinutesAsHours(grossMinutes - paidMinutes, locale) })}
          </p>
        )}
        <div className="flex gap-2">
          {openBreak ? (
            <Button
              variant="outline"
              className="h-auto min-h-11 min-w-0 flex-1 py-2 leading-tight whitespace-normal"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const result = await endBreakAction(openBreak.id);
                  if (result.error) toast.error(result.error);
                })
              }
            >
              <Coffee /> {m.time.endBreak}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="h-auto min-h-11 min-w-0 flex-1 py-2 leading-tight whitespace-normal"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const result = await startBreakAction(shift.id, false);
                  if (result.error) toast.error(result.error);
                })
              }
            >
              <Coffee /> {m.time.takeBreak}
            </Button>
          )}
          <Button
            variant="destructive"
            className="h-auto min-h-11 min-w-0 flex-1 py-2 leading-tight whitespace-normal"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await clockOutAction(shift.id);
                if (result.error) toast.error(result.error);
                else toast.success(m.time.clockedOut);
              })
            }
          >
            <Square /> {m.time.clockOut}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
