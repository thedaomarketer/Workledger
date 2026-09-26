"use client";

import { useActionState } from "react";

import { signUpAction, type ActionResult } from "@/lib/actions/auth";
import { useDeviceTimeZone } from "@/hooks/use-device-time-zone";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionResult = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  const { locale, m } = useI18n();
  // Seeds the new account's time zone and language; both can be changed later in Settings.
  const deviceTimeZone = useDeviceTimeZone();

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="timezone" value={deviceTimeZone ?? ""} />
      <input type="hidden" name="locale" value={locale} />
      <div className="space-y-2">
        <Label htmlFor="fullName">{m.auth.fullName}</Label>
        <Input id="fullName" name="fullName" autoComplete="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{m.auth.email}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{m.auth.password}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-xs text-muted-foreground">{m.auth.passwordHint}</p>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? m.auth.creatingAccount : m.auth.createAccount}
      </Button>
    </form>
  );
}
