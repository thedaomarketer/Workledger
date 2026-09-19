import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "./database.types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

/**
 * A Supabase client for use in Server Components, Server Actions, and Route
 * Handlers. Reads/writes the user's session via cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component that can't set cookies -- the
          // proxy (proxy.ts) already refreshes the session on every
          // request, so this is safe to ignore.
        }
      },
    },
  });
}
