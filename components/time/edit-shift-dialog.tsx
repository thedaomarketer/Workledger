"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil } from "lucide-react";

import { updateManualShiftAction, type ActionResult } from "@/lib/actions/shifts";
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

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}
function toTimeInput(iso: string) {
  return new Date(iso).toTimeString().slice(0, 5);
}

export function EditShiftDialog({
  shiftId,
  jobs,
  defaultValues,
}: {
  shiftId: string;
  jobs: { id: string; name: string }[];
  defaultValues: { jobId: string; actualStart: string; actualEnd: string; notes: string | null };
}) {
  const [open, setOpen] = useState(false);
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

  const startDate = toDateInput(defaultValues.actualStart);
  const endDate = toDateInput(defaultValues.actualEnd);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Edit shift</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ShiftFormFields
              jobs={jobs}
              showBreakField={false}
              defaultValues={{
                jobId: defaultValues.jobId,
                date: startDate,
                startTime: toTimeInput(defaultValues.actualStart),
                endTime: toTimeInput(defaultValues.actualEnd),
                endDate: endDate !== startDate ? endDate : "",
                notes: defaultValues.notes,
              }}
            />
          </div>
          {state.error && <p className="mb-2 text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
