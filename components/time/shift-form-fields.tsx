"use client";

import { useId } from "react";

import { fmt } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { timeZoneLabel } from "@/lib/timezone";
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
  timezone,
  defaultValues,
  showBreakField = true,
}: {
  jobs: Job[];
  /** The user's saved zone: every time typed here is read in it, server-side. */
  timezone: string;
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
  const { m } = useI18n();
  const dv = defaultValues ?? {};

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${id}-jobId`}>{m.common.job}</Label>
        <Select name="jobId" defaultValue={dv.jobId ?? jobs[0]?.id}>
          <SelectTrigger className="w-full" id={`${id}-jobId`}>
            <SelectValue placeholder={m.common.chooseJob} />
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
        <Label htmlFor={`${id}-date`}>{m.common.date}</Label>
        <Input id={`${id}-date`} name="date" type="date" defaultValue={dv.date} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${id}-startTime`}>{m.time.startTime}</Label>
          <Input id={`${id}-startTime`} name="startTime" type="time" defaultValue={dv.startTime} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-endTime`}>{m.time.endTime}</Label>
          <Input id={`${id}-endTime`} name="endTime" type="time" defaultValue={dv.endTime} required />
        </div>
        <p className="text-xs text-muted-foreground sm:col-span-2">
          {fmt(m.time.timesInZone, { zone: timeZoneLabel(timezone) })}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-endDate`}>{m.time.endDate}</Label>
        <Input id={`${id}-endDate`} name="endDate" type="date" defaultValue={dv.endDate ?? ""} />
        <p className="text-xs text-muted-foreground">
          {m.time.endDateHint}
        </p>
      </div>
      {showBreakField && (
        <div className="space-y-2">
          <Label htmlFor={`${id}-breakMinutes`}>{m.time.unpaidBreak}</Label>
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
        <Label htmlFor={`${id}-notes`}>{m.common.notes}</Label>
        <Textarea id={`${id}-notes`} name="notes" defaultValue={dv.notes ?? ""} rows={2} />
      </div>
    </div>
  );
}
