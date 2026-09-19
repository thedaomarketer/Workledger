"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { createJobAction, type ActionResult } from "@/lib/actions/jobs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { JobFormFields } from "./job-form-fields";

const initialState: ActionResult = {};

export function CreateJobDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createJobAction, initialState);

  useEffect(() => {
    if (!pending && state === initialState) return;
    // Close the dialog once the server action reports success; this is
    // the one legitimate use of setState-in-effect here, since useActionState
    // gives no other hook into "the action just finished".
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!pending && !state.error) setOpen(false);
  }, [pending, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Add job
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Add a job</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <JobFormFields />
          </div>
          {state.error && <p className="mb-2 text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
