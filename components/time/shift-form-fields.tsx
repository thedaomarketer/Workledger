"use client";

import { useId } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Job {
  id: string;
  name: string;
}

export function ShiftFormFields({
  jobs,
  defaultValues,
  showBreakField = true,
}: {
  jobs: Job[];
  defaultValues?: {
    jobId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    endDate?: string;
    breakMinutes?: number;
    notes?: string | null;
  };
  showBreakField?: boolean;
}) {
  const id = useId();
  const dv = defaultValues ?? {};

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${id}-jobId`}>Job</Label>
        <Select name="jobId" defaultValue={dv.jobId ?? jobs[0]?.id}>
          <SelectTrigger className="w-full" id={`${id}-jobId`}>
            <SelectValue placeholder="Choose a job" />
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
      <div className="space-y-2">
        <Label htmlFor={`${id}-date`}>Date</Label>
        <Input id={`${id}-date`} name="date" type="date" defaultValue={dv.date} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${id}-startTime`}>Start time</Label>
          <Input id={`${id}-startTime`} name="startTime" type="time" defaultValue={dv.startTime} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-endTime`}>End time</Label>
          <Input id={`${id}-endTime`} name="endTime" type="time" defaultValue={dv.endTime} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-endDate`}>End date (only if different from start)</Label>
        <Input id={`${id}-endDate`} name="endDate" type="date" defaultValue={dv.endDate ?? ""} />
        <p className="text-xs text-muted-foreground">
          Leave blank for an overnight shift — an earlier end time is assumed to roll into the next day.
        </p>
      </div>
      {showBreakField && (
        <div className="space-y-2">
          <Label htmlFor={`${id}-breakMinutes`}>Unpaid break (minutes)</Label>
          <Input
            id={`${id}-breakMinutes`}
            name="breakMinutes"
            type="number"
            min={0}
            step={5}
            defaultValue={dv.breakMinutes ?? 0}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor={`${id}-notes`}>Notes</Label>
        <Textarea id={`${id}-notes`} name="notes" defaultValue={dv.notes ?? ""} rows={2} />
      </div>
    </div>
  );
}
