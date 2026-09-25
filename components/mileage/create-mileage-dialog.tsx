"use client";

import { useActionState, useEffect, useId } from "react";
import { Plus } from "lucide-react";

import { createMileageEntryAction, type ActionResult } from "@/lib/actions/mileage";
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

const initialState: ActionResult = {};

function todayLocal(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CreateMileageDialog({ jobs }: { jobs: { id: string; name: string }[] }) {
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
          <Plus /> Add trip
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Log a trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`${id}-date`}>Date</Label>
            <Input id={`${id}-date`} name="date" type="date" defaultValue={todayLocal()} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${id}-startLocation`}>From</Label>
              <Input id={`${id}-startLocation`} name="startLocation" />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-endLocation`}>To</Label>
              <Input id={`${id}-endLocation`} name="endLocation" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor={`${id}-distance`}>Distance</Label>
              <Input id={`${id}-distance`} name="distance" type="number" min="0" step="0.1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-unit`}>Unit</Label>
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
              <Label htmlFor={`${id}-rate`}>Rate / unit</Label>
              <Input id={`${id}-rate`} name="rate" type="number" min="0" step="0.001" defaultValue="0" />
            </div>
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
            <Label htmlFor={`${id}-notes`}>Notes</Label>
            <Textarea id={`${id}-notes`} name="notes" rows={2} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
