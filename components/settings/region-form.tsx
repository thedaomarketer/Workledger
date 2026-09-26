"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { updateRegionAction, type ActionResult } from "@/lib/actions/settings";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeZonePicker } from "./time-zone-picker";

const initialState: ActionResult = {};

export function RegionForm({
  profile,
}: {
  profile: { locale: Locale; timezone: string; currency: string };
}) {
  const { m } = useI18n();
  const t = m.settings.region;
  const [state, formAction, pending] = useActionState(updateRegionAction, initialState);

  useEffect(() => {
    if (state.success) toast.success(t.saved);
    // `t` changes when the language does; only toast once per save.
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
              <Label htmlFor="locale">{t.language}</Label>
              <Select name="locale" defaultValue={profile.locale}>
                <SelectTrigger className="w-full" id="locale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCALES.map((locale) => (
                    <SelectItem key={locale} value={locale} lang={locale}>
                      {LOCALE_NAMES[locale]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">{t.currency}</Label>
              <Input
                id="currency"
                name="currency"
                maxLength={3}
                defaultValue={profile.currency}
                autoCapitalize="characters"
                className="uppercase"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label id="timezone-label">{t.timezone}</Label>
            <TimeZonePicker name="timezone" defaultValue={profile.timezone} labelId="timezone-label" />
          </div>
          <p className="text-xs text-muted-foreground">{t.datesHint}</p>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? m.common.saving : t.save}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
