import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "./env";

/**
 * Service-role Supabase client that bypasses Row Level Security. Only use
 * this for trusted, server-only operations that must act across a user's
 * data on their behalf after the request has already been authorized (e.g.
 * writing audit_logs, issuing signed URLs for attachments). Never import
 * this module from a Client Component -- the `server-only` import above
 * makes that a build error.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
