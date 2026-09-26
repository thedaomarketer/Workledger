"use client";

import { useActionState, useEffect } from "react";
import { Plus } from "lucide-react";

import { createManualShiftAction, type ActionResult } from "@/lib/actions/shifts";
import { useAutoOpen } from "@/hooks/use-auto-open";
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

export function ManualShiftDialog({ jobs, timezone }: { jobs: { id: string; name: string }[]; timezone: string }) {
  const { m } = useI18n();
  const [open, setOpen] = useAutoOpen("shift");
  const [state, formAction, pending] = useActionState(createManualShiftAction, initialState);

  useEffect(() => {
    if (!pending && state === initialState) return;
    // Close the dialog once the server action reports success; useActionState
    // gives no other hook into "the action just finished".
    if (!pending && !state.error) setOpen(false);
  }, [pending, state, setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus /> {m.time.addShiftManually}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>{m.time.addShiftTitle}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ShiftFormFields jobs={jobs} timezone={timezone} />
          </div>
          {state.error && <p className="mb-2 text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending || jobs.length === 0}>
              {pending ? m.common.saving : m.time.saveShift}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
