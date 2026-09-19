"use client";

import { useId } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const PRESET_COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#db2777",
  "#0891b2",
  "#525252",
];

export function JobFormFields({
  defaultValues,
}: {
  defaultValues?: {
    name?: string;
    companyName?: string | null;
    jobTitle?: string | null;
    description?: string | null;
    hourlyRate?: number | null;
    overtimeRate?: number | null;
    overtimeThresholdMinutes?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    color?: string;
    notes?: string | null;
  };
}) {
  const id = useId();
  const dv = defaultValues ?? {};

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${id}-name`}>Job name *</Label>
          <Input id={`${id}-name`} name="name" defaultValue={dv.name} placeholder="Maple Restaurant" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-jobTitle`}>Your title</Label>
          <Input id={`${id}-jobTitle`} name="jobTitle" defaultValue={dv.jobTitle ?? ""} placeholder="Chef" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-companyName`}>Company / employer</Label>
        <Input id={`${id}-companyName`} name="companyName" defaultValue={dv.companyName ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${id}-hourlyRate`}>Hourly rate</Label>
          <Input
            id={`${id}-hourlyRate`}
            name="hourlyRate"
            type="number"
            min={0}
            step="0.01"
            defaultValue={dv.hourlyRate ?? ""}
            placeholder="24.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-overtimeRate`}>Overtime rate</Label>
          <Input
            id={`${id}-overtimeRate`}
            name="overtimeRate"
            type="number"
            min={0}
            step="0.01"
            defaultValue={dv.overtimeRate ?? ""}
            placeholder="36.00"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-overtimeThresholdHours`}>Overtime after (hours/week)</Label>
        <Input
          id={`${id}-overtimeThresholdHours`}
          name="overtimeThresholdHours"
          type="number"
          min={0}
          step="1"
          defaultValue={
            dv.overtimeThresholdMinutes != null ? Math.round(dv.overtimeThresholdMinutes / 60) : ""
          }
          placeholder="44"
        />
        <p className="text-xs text-muted-foreground">Leave blank to disable overtime for this job.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${id}-startDate`}>Start date</Label>
          <Input id={`${id}-startDate`} name="startDate" type="date" defaultValue={dv.startDate ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-endDate`}>End date</Label>
          <Input id={`${id}-endDate`} name="endDate" type="date" defaultValue={dv.endDate ?? ""} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-color`}>Color</Label>
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_COLORS.map((color) => (
            <label key={color} className="cursor-pointer">
              <input
                type="radio"
                name="color"
                value={color}
                defaultChecked={(dv.color ?? PRESET_COLORS[0]) === color}
                className="peer sr-only"
              />
              <span
                className="block size-7 rounded-full ring-offset-2 ring-offset-background peer-checked:ring-2 peer-checked:ring-foreground"
                style={{ backgroundColor: color }}
              />
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-description`}>Description</Label>
        <Textarea id={`${id}-description`} name="description" defaultValue={dv.description ?? ""} rows={2} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-notes`}>Notes</Label>
        <Textarea id={`${id}-notes`} name="notes" defaultValue={dv.notes ?? ""} rows={2} />
      </div>
    </div>
  );
}
