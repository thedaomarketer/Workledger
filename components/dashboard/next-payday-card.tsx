import Link from "next/link";
import { CalendarClock } from "lucide-react";

import type { JobPayday } from "@/lib/data/tax";
import { Card, CardContent } from "@/components/ui/card";

function daysUntil(date: Date): number {
  const now = new Date();
  return Math.ceil((date.getTime() - now.getTime()) / 86_400_000);
}

function formatPayday(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(date);
}

export function NextPaydayCard({ payday }: { payday: JobPayday }) {
  const days = daysUntil(payday.nextPayday);
  const daysLabel = days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`;

  return (
    <Link href="/taxes">
      <Card className="transition-colors hover:bg-accent/40">
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <CalendarClock className="size-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              Next payday: {formatPayday(payday.nextPayday)} · {payday.jobName}
            </p>
            <p className="text-xs text-muted-foreground">{daysLabel}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
