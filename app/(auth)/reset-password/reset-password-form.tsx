"use client";

import { useActionState } from "react";

import { requestPasswordResetAction, type ActionResult } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionResult = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);
  const submitted = state !== initialState && !state.error;

  if (submitted) {
    return (
      <p className="text-sm text-muted-foreground">
        If an account exists for that email, a reset link is on its way.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
