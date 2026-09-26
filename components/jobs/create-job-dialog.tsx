"use client";

import { useActionState, useEffect } from "react";
import { Plus } from "lucide-react";

import { createJobAction, type ActionResult } from "@/lib/actions/jobs";
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
import { JobFormFields } from "./job-form-fields";

const initialState: ActionResult = {};

export function CreateJobDialog() {
  const [open, setOpen] = useAutoOpen("1");
  const { m } = useI18n();
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
          <Plus /> {m.jobs.addJob}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>{m.jobs.addJobTitle}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <JobFormFields />
          </div>
          {state.error && <p className="mb-2 text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? m.common.saving : m.jobs.saveJob}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
