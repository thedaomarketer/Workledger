"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteMileageEntryAction } from "@/lib/actions/mileage";
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

  if (entries.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No trips logged yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Trip</TableHead>
          <TableHead>Job</TableHead>
          <TableHead className="text-right">Distance</TableHead>
          <TableHead className="text-right">Reimbursement</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{entry.date}</TableCell>
            <TableCell>
              {entry.start_location || entry.end_location
                ? `${entry.start_location ?? "—"} → ${entry.end_location ?? "—"}`
                : "—"}
            </TableCell>
            <TableCell>{entry.job?.name ?? "—"}</TableCell>
            <TableCell className="text-right tabular-nums">
              {entry.distance} {entry.unit}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(entry.reimbursement)}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
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
