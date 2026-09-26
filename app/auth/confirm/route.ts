import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { isLocale } from "@/lib/i18n/config";
import { setLocaleCookie } from "@/lib/i18n/server";
import { safeRedirectPath } from "@/lib/safe-redirect";

// Handles Supabase email confirmation / magic link / password recovery
// links, which arrive as GET requests with a `token_hash` + `type`.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // `next` rides along in the emailed link, so it is attacker-controllable.
  const next = safeRedirectPath(searchParams.get("next"), "/dashboard");

  if (token_hash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("locale")
          .eq("id", data.user.id)
          .maybeSingle();
        if (isLocale(profile?.locale)) await setLocaleCookie(profile.locale);
      }
      redirect(type === "recovery" ? "/update-password" : next);
    }
  }

  redirect("/login?error=confirmation-failed");
}
