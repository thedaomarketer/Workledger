"use client";

import { useActionState, useEffect } from "react";
import { Plus } from "lucide-react";

import { createJobAction, type ActionResult } from "@/lib/actions/jobs";
import { useAutoOpen } from "@/hooks/use-auto-open";
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
  const [open, setOpen] = useAutoOpen("1");
  const [state, formAction, pending] = useActionState(createJobAction, initialState);

  useEffect(() => {
    if (!pending && state === initialState) return;
    // Close the dialog once the server action reports success; useActionState
    // gives no other hook into "the action just finished".
    if (!pending && !state.error) setOpen(false);
  }, [pending, state, setOpen]);

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
