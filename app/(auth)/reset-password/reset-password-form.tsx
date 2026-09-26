"use client";

import { useActionState } from "react";

import { requestPasswordResetAction, type ActionResult } from "@/lib/actions/auth";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionResult = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);
  const { m } = useI18n();
  const submitted = state !== initialState && !state.error;

  if (submitted) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        {m.auth.resetSent}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{m.auth.email}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? m.auth.sending : m.auth.sendResetLink}
      </Button>
    </form>
  );
}
