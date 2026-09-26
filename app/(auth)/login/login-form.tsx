"use client";

import { useActionState } from "react";
import Link from "next/link";

import { signInAction, type ActionResult } from "@/lib/actions/auth";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionResult = {};

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const { m } = useI18n();

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
      <div className="space-y-2">
        <Label htmlFor="email">{m.auth.email}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{m.auth.password}</Label>
          <Link href="/reset-password" className="text-xs font-medium text-primary hover:underline">
            {m.auth.forgotPassword}
          </Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? m.auth.signingIn : m.auth.signIn}
      </Button>
    </form>
  );
}
