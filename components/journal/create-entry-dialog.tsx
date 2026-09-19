"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { Plus } from "lucide-react";

import { createJournalEntryAction, type ActionResult } from "@/lib/actions/journal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENTRY_TYPE_OPTIONS } from "./entry-type-config";

const initialState: ActionResult = {};

function nowLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function CreateEntryDialog({ jobs }: { jobs: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createJournalEntryAction, initialState);
  const id = useId();

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
          <Plus /> Add entry
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add a journal entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`${id}-entryType`}>Type</Label>
            <Select name="entryType" defaultValue="general">
              <SelectTrigger className="w-full" id={`${id}-entryType`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTRY_TYPE_OPTIONS.map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {jobs.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor={`${id}-jobId`}>Job (optional)</Label>
              <Select name="jobId">
                <SelectTrigger className="w-full" id={`${id}-jobId`}>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor={`${id}-eventAt`}>When</Label>
            <Input id={`${id}-eventAt`} name="eventAt" type="datetime-local" defaultValue={nowLocal()} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-title`}>Title</Label>
            <Input id={`${id}-title`} name="title" placeholder="Short summary" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-content`}>Details</Label>
            <Textarea id={`${id}-content`} name="content" rows={4} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
