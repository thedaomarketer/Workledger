"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  requestPasswordResetSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/lib/validation/auth";

export interface ActionResult {
  error?: string;
}

function getOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signUpAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${getOrigin()}/auth/confirm`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?registered=1");
}

export async function signInAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "That email and password combination doesn't match our records." };
  }

  const redirectTo = formData.get("redirectTo");
  redirect(typeof redirectTo === "string" && redirectTo ? redirectTo : "/dashboard");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = requestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  // Always report success regardless of whether the email exists, so we
  // don't leak account existence.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getOrigin()}/update-password`,
  });

  return {};
}

export async function updatePasswordAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
