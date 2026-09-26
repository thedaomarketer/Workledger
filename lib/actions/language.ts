"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { isLocale } from "@/lib/i18n/config";
import { setLocaleCookie } from "@/lib/i18n/server";

/**
 * The language switcher on public pages (landing, sign-in, sign-up). Sets
 * the language cookie; if someone happens to be signed in, their profile is
 * updated too so the choice follows them to other devices.
 */
export async function setLanguageAction(locale: string): Promise<void> {
  if (!isLocale(locale)) return;

  await setLocaleCookie(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("profiles").update({ locale }).eq("id", user.id);
  }

  revalidatePath("/", "layout");
}
