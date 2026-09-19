"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { updatePreferencesAction, type ActionResult } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: ActionResult = {};

const WEEK_START_OPTIONS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "6", label: "Saturday" },
];

export function PreferencesForm({
  settings,
}: {
  settings: {
    week_starts_on: number;
    default_break_minutes: number;
    overtime_enabled: boolean;
    overtime_threshold_minutes: number;
    notifications_enabled: boolean;
  };
}) {
  const [state, formAction, pending] = useActionState(updatePreferencesAction, initialState);
  const [overtimeEnabled, setOvertimeEnabled] = useState(settings.overtime_enabled);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notifications_enabled);

  useEffect(() => {
    if (state.success) toast.success("Preferences saved.");
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weekStartsOn">Week starts on</Label>
              <Select name="weekStartsOn" defaultValue={String(settings.week_starts_on)}>
                <SelectTrigger className="w-full" id="weekStartsOn">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEK_START_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultBreakMinutes">Default break length (minutes)</Label>
              <Input
                id="defaultBreakMinutes"
                name="defaultBreakMinutes"
                type="number"
                min={0}
                defaultValue={settings.default_break_minutes}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Overtime tracking</p>
              <p className="text-xs text-muted-foreground">Applies when a job doesn&apos;t set its own threshold.</p>
            </div>
            <Switch
              checked={overtimeEnabled}
              onCheckedChange={setOvertimeEnabled}
              name="overtimeEnabled"
            />
          </div>
          {overtimeEnabled && (
            <div className="space-y-2">
              <Label htmlFor="overtimeThresholdHours">Overtime after (hours/week)</Label>
              <Input
                id="overtimeThresholdHours"
                name="overtimeThresholdHours"
                type="number"
                min={0}
                defaultValue={Math.round(settings.overtime_threshold_minutes / 60)}
              />
            </div>
          )}

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Notifications</p>
              <p className="text-xs text-muted-foreground">Shift, clock-in, and break reminders.</p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
              name="notificationsEnabled"
            />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save preferences"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
