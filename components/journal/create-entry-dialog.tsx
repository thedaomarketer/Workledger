"use client";

import { useActionState, useEffect, useId } from "react";
import { Plus } from "lucide-react";

import { createJournalEntryAction, type ActionResult } from "@/lib/actions/journal";
import { useAutoOpen } from "@/hooks/use-auto-open";
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
import { instantToLocalInputs } from "@/lib/calculations/local-time";
import { fmt } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { timeZoneLabel } from "@/lib/timezone";
import { ENTRY_TYPES } from "./entry-type-config";

const initialState: ActionResult = {};

/** "Now" as a datetime-local value in the user's saved time zone (not the device's). */
function nowInZone(timezone: string): string {
  const { date, time } = instantToLocalInputs(new Date(), timezone);
  return `${date}T${time}`;
}

export function CreateEntryDialog({ jobs, timezone }: { jobs: { id: string; name: string }[]; timezone: string }) {
  const { m } = useI18n();
  const [open, setOpen] = useAutoOpen("1");
  const [state, formAction, pending] = useActionState(createJournalEntryAction, initialState);
  const id = useId();

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
          <Plus /> {m.journal.addEntry}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{m.journal.addEntryTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`${id}-entryType`}>{m.journal.type}</Label>
            <Select name="entryType" defaultValue="general">
              <SelectTrigger className="w-full" id={`${id}-entryType`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTRY_TYPES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {m.journal.types[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {jobs.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor={`${id}-jobId`}>{m.common.jobOptional}</Label>
              <Select name="jobId">
                <SelectTrigger className="w-full" id={`${id}-jobId`}>
                  <SelectValue placeholder={m.common.none} />
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
            <Label htmlFor={`${id}-eventAt`}>{m.journal.when}</Label>
            <Input
              id={`${id}-eventAt`}
              name="eventAt"
              type="datetime-local"
              defaultValue={nowInZone(timezone)}
              aria-describedby={`${id}-eventAt-hint`}
              required
            />
            <p id={`${id}-eventAt-hint`} className="text-xs text-muted-foreground">
              {fmt(m.time.timesInZone, { zone: timeZoneLabel(timezone) })}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-title`}>{m.journal.entryTitle}</Label>
            <Input id={`${id}-title`} name="title" placeholder={m.journal.entryTitlePlaceholder} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-content`}>{m.journal.details}</Label>
            <Textarea id={`${id}-content`} name="content" rows={4} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? m.common.saving : m.journal.saveEntry}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
