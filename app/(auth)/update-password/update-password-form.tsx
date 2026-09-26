"use client";

import { useActionState } from "react";

import { updatePasswordAction, type ActionResult } from "@/lib/actions/auth";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionResult = {};

export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialState);
  const { m } = useI18n();

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">{m.auth.newPassword}</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{m.auth.confirmPassword}</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? m.auth.updating : m.auth.updatePassword}
      </Button>
    </form>
  );
}
