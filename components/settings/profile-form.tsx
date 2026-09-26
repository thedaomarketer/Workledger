"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { updateProfileAction, type ActionResult } from "@/lib/actions/settings";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: ActionResult = {};

export function ProfileForm({
  profile,
}: {
  profile: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    country: string | null;
    default_hourly_rate: number | null;
  };
}) {
  const { m } = useI18n();
  const t = m.settings;
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  useEffect(() => {
    if (state.success) toast.success(t.profileSaved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.profile}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t.fullName}</Label>
              <Input id="fullName" name="fullName" defaultValue={profile.full_name ?? ""} autoComplete="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input id="email" value={profile.email ?? ""} disabled />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone}</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} autoComplete="tel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">{t.country}</Label>
              <Input id="country" name="country" defaultValue={profile.country ?? ""} autoComplete="country-name" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultHourlyRate">{t.defaultHourlyRate}</Label>
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
            {pending ? m.common.saving : t.saveProfile}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
