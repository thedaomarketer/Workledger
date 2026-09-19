"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil } from "lucide-react";

import { updateJobAction, type ActionResult } from "@/lib/actions/jobs";
import type { Database } from "@/lib/supabase/database.types";
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

type Job = Database["public"]["Tables"]["jobs"]["Row"];

export function EditJobDialog({ job }: { job: Job }) {
  const [open, setOpen] = useState(false);
  const boundAction = updateJobAction.bind(null, job.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

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
        <Button variant="outline" size="sm">
          <Pencil /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Edit job</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <JobFormFields
              defaultValues={{
                name: job.name,
                companyName: job.company_name,
                jobTitle: job.job_title,
                description: job.description,
                hourlyRate: job.hourly_rate,
                overtimeRate: job.overtime_rate,
                overtimeThresholdMinutes: job.overtime_threshold_minutes,
                startDate: job.start_date,
                endDate: job.end_date,
                color: job.color,
                notes: job.notes,
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
