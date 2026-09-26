"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil } from "lucide-react";

import { updateManualShiftAction, type ActionResult } from "@/lib/actions/shifts";
import { instantToLocalInputs } from "@/lib/calculations/local-time";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShiftFormFields } from "./shift-form-fields";

const initialState: ActionResult = {};

export function EditShiftDialog({
  shiftId,
  jobs,
  timezone,
  defaultValues,
}: {
  shiftId: string;
  jobs: { id: string; name: string }[];
  timezone: string;
  defaultValues: { jobId: string; actualStart: string; actualEnd: string; notes: string | null };
}) {
  const [open, setOpen] = useState(false);
  const { m } = useI18n();
  const boundAction = updateManualShiftAction.bind(null, shiftId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (!pending && state === initialState) return;
    // Close the dialog once the server action reports success; this is
    // the one legitimate use of setState-in-effect here, since useActionState
    // gives no other hook into "the action just finished".
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!pending && !state.error) setOpen(false);
  }, [pending, state]);

  // Pre-fill in the user's saved zone -- the same zone the action reads the
  // submitted values in -- so saving without changes is a no-op.
  const start = instantToLocalInputs(defaultValues.actualStart, timezone);
  const end = instantToLocalInputs(defaultValues.actualEnd, timezone);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={m.time.editShiftLabel}>
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>{m.time.editShift}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ShiftFormFields
              jobs={jobs}
              timezone={timezone}
              showBreakField={false}
              defaultValues={{
                jobId: defaultValues.jobId,
                date: start.date,
                startTime: start.time,
                endTime: end.time,
                endDate: end.date !== start.date ? end.date : "",
                notes: defaultValues.notes,
              }}
            />
          </div>
          {state.error && <p className="mb-2 text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? m.common.saving : m.common.saveChanges}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
