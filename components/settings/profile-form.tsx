"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { updateProfileAction, type ActionResult } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: ActionResult = {};

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Australia/Sydney",
];

export function ProfileForm({
  profile,
}: {
  profile: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    country: string | null;
    timezone: string;
    currency: string;
    date_format: string;
    default_hourly_rate: number | null;
  };
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  useEffect(() => {
    if (state.success) toast.success("Profile saved.");
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" defaultValue={profile.full_name ?? ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email ?? ""} disabled />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue={profile.country ?? ""} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="timezone">Time zone</Label>
              <Select name="timezone" defaultValue={profile.timezone}>
                <SelectTrigger className="w-full" id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" maxLength={3} defaultValue={profile.currency} className="uppercase" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date format</Label>
              <Select name="dateFormat" defaultValue={profile.date_format}>
                <SelectTrigger className="w-full" id="dateFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultHourlyRate">Default hourly rate</Label>
            <Input
              id="defaultHourlyRate"
              name="defaultHourlyRate"
              type="number"
              min="0"
              step="0.01"
              defaultValue={profile.default_hourly_rate ?? ""}
            />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
