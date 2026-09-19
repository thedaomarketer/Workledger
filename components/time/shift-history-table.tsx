import { calculateShiftDuration } from "@/lib/calculations";
import { formatDate, formatMinutesAsHours, formatTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditShiftDialog } from "./edit-shift-dialog";
import { DeleteShiftButton } from "./delete-shift-button";

interface BreakRow {
  started_at: string;
  ended_at: string | null;
  is_paid: boolean;
}

export interface ShiftHistoryRow {
  id: string;
  actual_start: string | null;
  actual_end: string | null;
  status: string;
  notes: string | null;
  breaks: BreakRow[];
  job: { id: string; name: string; color: string } | null;
}

export function ShiftHistoryTable({
  shifts,
  jobs,
  timezone,
}: {
  shifts: ShiftHistoryRow[];
  jobs: { id: string; name: string }[];
  timezone: string;
}) {
  if (shifts.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No shifts recorded yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Job</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Paid</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shifts.map((shift) => {
          if (!shift.actual_start) return null;
          const result = calculateShiftDuration({
            start: shift.actual_start,
            end: shift.actual_end,
            breaks: shift.breaks.map((b) => ({ startedAt: b.started_at, endedAt: b.ended_at, isPaid: b.is_paid })),
          });

          return (
            <TableRow key={shift.id}>
              <TableCell>{formatDate(shift.actual_start, timezone)}</TableCell>
              <TableCell>
                {shift.job && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ backgroundColor: shift.job.color }} />
                    {shift.job.name}
                  </span>
                )}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatTime(shift.actual_start, timezone)}
                {shift.actual_end ? ` – ${formatTime(shift.actual_end, timezone)}` : " – ongoing"}
              </TableCell>
              <TableCell className="tabular-nums">
                {result.isComplete ? formatMinutesAsHours(result.paidMinutes) : "—"}
              </TableCell>
              <TableCell>
                <Badge variant={shift.status === "active" ? "success" : "outline"} className="capitalize">
                  {shift.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {shift.status !== "active" && shift.actual_end && (
                  <div className="flex justify-end gap-1">
                    <EditShiftDialog
                      shiftId={shift.id}
                      jobs={jobs}
                      defaultValues={{
                        jobId: shift.job?.id ?? "",
                        actualStart: shift.actual_start,
                        actualEnd: shift.actual_end,
                        notes: shift.notes,
                      }}
                    />
                    <DeleteShiftButton shiftId={shift.id} />
                  </div>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
