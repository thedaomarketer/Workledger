"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { updatePreferencesAction, type ActionResult } from "@/lib/actions/settings";
import { useI18n } from "@/lib/i18n/client";
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
  { value: "0", label: "sunday" },
  { value: "1", label: "monday" },
  { value: "6", label: "saturday" },
] as const;

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
  const { m } = useI18n();
  const t = m.settings.preferences;
  const [state, formAction, pending] = useActionState(updatePreferencesAction, initialState);
  const [overtimeEnabled, setOvertimeEnabled] = useState(settings.overtime_enabled);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notifications_enabled);

  useEffect(() => {
    if (state.success) toast.success(t.saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weekStartsOn">{t.weekStartsOn}</Label>
              <Select name="weekStartsOn" defaultValue={String(settings.week_starts_on)}>
                <SelectTrigger className="w-full" id="weekStartsOn">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEK_START_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t[opt.label]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultBreakMinutes">{t.defaultBreak}</Label>
              <Input
                id="defaultBreakMinutes"
                name="defaultBreakMinutes"
                type="number"
                min={0}
                defaultValue={settings.default_break_minutes}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl bg-muted px-3.5 py-3">
            <div>
              <p id="overtime-label" className="text-sm font-medium">{t.overtimeTracking}</p>
              <p className="text-xs text-muted-foreground">{t.overtimeHint}</p>
            </div>
            <Switch
              checked={overtimeEnabled}
              onCheckedChange={setOvertimeEnabled}
              name="overtimeEnabled"
              aria-labelledby="overtime-label"
            />
          </div>
          {overtimeEnabled && (
            <div className="space-y-2">
              <Label htmlFor="overtimeThresholdHours">{t.overtimeAfter}</Label>
              <Input
                id="overtimeThresholdHours"
                name="overtimeThresholdHours"
                type="number"
                min={0}
                defaultValue={Math.round(settings.overtime_threshold_minutes / 60)}
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-4 rounded-xl bg-muted px-3.5 py-3">
            <div>
              <p id="notifications-label" className="text-sm font-medium">{t.notifications}</p>
              <p className="text-xs text-muted-foreground">{t.notificationsHint}</p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
              name="notificationsEnabled"
              aria-labelledby="notifications-label"
            />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? m.common.saving : t.save}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
