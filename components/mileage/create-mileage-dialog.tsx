"use client";

import { useActionState, useEffect, useId } from "react";
import { Plus } from "lucide-react";

import { createMileageEntryAction, type ActionResult } from "@/lib/actions/mileage";
import { useAutoOpen } from "@/hooks/use-auto-open";
import { localDateString } from "@/lib/calculations/local-time";
import { useI18n } from "@/lib/i18n/client";
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

const initialState: ActionResult = {};

export function CreateMileageDialog({ jobs, timezone }: { jobs: { id: string; name: string }[]; timezone: string }) {
  const { m } = useI18n();
  const [open, setOpen] = useAutoOpen("1");
  const [state, formAction, pending] = useActionState(createMileageEntryAction, initialState);
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
          <Plus /> {m.mileage.addTrip}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{m.mileage.logTrip}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`${id}-date`}>{m.common.date}</Label>
            <Input id={`${id}-date`} name="date" type="date" defaultValue={localDateString(new Date(), timezone)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${id}-startLocation`}>{m.mileage.from}</Label>
              <Input id={`${id}-startLocation`} name="startLocation" />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-endLocation`}>{m.mileage.to}</Label>
              <Input id={`${id}-endLocation`} name="endLocation" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor={`${id}-distance`}>{m.mileage.distance}</Label>
              <Input id={`${id}-distance`} name="distance" type="number" min="0" step="0.1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-unit`}>{m.mileage.unit}</Label>
              <Select name="unit" defaultValue="km">
                <SelectTrigger className="w-full" id={`${id}-unit`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="km">km</SelectItem>
                  <SelectItem value="mi">mi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-rate`}>{m.mileage.rate}</Label>
              <Input id={`${id}-rate`} name="rate" type="number" min="0" step="0.001" defaultValue="0" />
            </div>
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
            <Label htmlFor={`${id}-notes`}>{m.common.notes}</Label>
            <Textarea id={`${id}-notes`} name="notes" rows={2} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? m.common.saving : m.mileage.saveTrip}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
