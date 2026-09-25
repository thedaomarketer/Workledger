import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/data/context";
import { getLocalMonthBounds } from "@/lib/calculations";
import { formatDate, formatTime } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const ctx = await requireUserContext();
  if (!ctx) return null;

  const anchor = params.month ? new Date(`${params.month}-01T00:00:00`) : new Date();
  const { start, end } = getLocalMonthBounds(anchor, ctx.timezone);

  const prevMonth = new Date(start);
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const nextMonth = new Date(start);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const monthParam = (d: Date) => d.toISOString().slice(0, 7);

  const supabase = await createClient();
  const [{ data: shifts }, { data: scheduleEntries }] = await Promise.all([
    supabase
      .from("shifts")
      .select("*, job:jobs(name, color)")
      .eq("user_id", ctx.userId)
      .not("actual_start", "is", null)
      .gte("actual_start", start.toISOString())
      .lt("actual_start", end.toISOString())
      .order("actual_start"),
    supabase
      .from("schedule_entries")
      .select("*, job:jobs(name, color)")
      .eq("user_id", ctx.userId)
      .gte("start_at", start.toISOString())
      .lt("start_at", end.toISOString())
      .order("start_at"),
  ]);

  type Item = { id: string; at: string; label: string; sub: string; color: string; badge: string };
  const items: Item[] = [
    ...(shifts ?? []).map((s) => ({
      id: `shift-${s.id}`,
      at: s.actual_start!,
      label: s.job?.name ?? "Shift",
      sub: `${formatTime(s.actual_start!, ctx.timezone)}${s.actual_end ? ` – ${formatTime(s.actual_end, ctx.timezone)}` : ""}`,
      color: s.job?.color ?? "#525252",
      badge: s.status === "active" ? "Working now" : "Worked",
    })),
    ...(scheduleEntries ?? []).map((s) => ({
      id: `sched-${s.id}`,
      at: s.start_at,
      label: s.job?.name ?? "Scheduled",
      sub: `${formatTime(s.start_at, ctx.timezone)} – ${formatTime(s.end_at, ctx.timezone)}`,
      color: s.job?.color ?? "#525252",
      badge: "Scheduled",
    })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  const byDate = new Map<string, Item[]>();
  for (const item of items) {
    const key = formatDate(item.at, ctx.timezone);
    byDate.set(key, [...(byDate.get(key) ?? []), item]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] leading-tight font-bold tracking-tight md:text-3xl">
          {start.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: ctx.timezone })}
        </h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="icon">
            <Link href={`/calendar?month=${monthParam(prevMonth)}`}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon">
            <Link href={`/calendar?month=${monthParam(nextMonth)}`}>
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {byDate.size === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nothing scheduled or worked this month.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {[...byDate.entries()].map(([date, dayItems]) => (
            <Card key={date}>
              <CardContent className="py-4">
                <p className="mb-2 text-sm font-medium">{date}</p>
                <ul className="space-y-2">
                  {dayItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-2 text-sm">
                      <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium">{item.label}</span>
                      <span className="text-muted-foreground">{item.sub}</span>
                      <Badge variant="outline" className="ml-auto">
                        {item.badge}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
