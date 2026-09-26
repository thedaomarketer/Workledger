"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteMileageEntryAction } from "@/lib/actions/mileage";
import { dollarsToCents, formatCents } from "@/lib/calculations/money";
import { formatCalendarDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface MileageRow {
  id: string;
  date: string;
  start_location: string | null;
  end_location: string | null;
  distance: number;
  unit: "km" | "mi";
  reimbursement: number;
  job: { name: string; color: string } | null;
}

export function MileageList({ entries, currency }: { entries: MileageRow[]; currency: string }) {
  const [isPending, startTransition] = useTransition();
  const { intl, m } = useI18n();

  if (entries.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{m.mileage.empty}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{m.common.date}</TableHead>
          <TableHead>{m.mileage.trip}</TableHead>
          <TableHead>{m.common.job}</TableHead>
          <TableHead className="text-right">{m.mileage.distance}</TableHead>
          <TableHead className="text-right">{m.mileage.reimbursement}</TableHead>
          <TableHead className="text-right">{m.common.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="whitespace-nowrap">{formatCalendarDate(entry.date, intl)}</TableCell>
            <TableCell>
              {entry.start_location || entry.end_location
                ? `${entry.start_location ?? "—"} → ${entry.end_location ?? "—"}`
                : "—"}
            </TableCell>
            <TableCell>{entry.job?.name ?? "—"}</TableCell>
            <TableCell className="text-right tabular-nums">
              {entry.distance.toLocaleString(intl)} {entry.unit}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatCents(dollarsToCents(entry.reimbursement), currency, intl)}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                aria-label={m.mileage.deleteTrip}
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await deleteMileageEntryAction(entry.id);
                    if (result.error) toast.error(result.error);
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
