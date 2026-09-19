import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { AuditAction } from "@/lib/supabase/database.types";

export async function logAudit(params: {
  userId: string;
  entityType: string;
  entityId?: string | null;
  action: AuditAction;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
}): Promise<void> {
  // Audit logging must never block the primary action from succeeding, so
  // this catches everything -- including a missing/invalid service-role
  // key -- and only ever logs the failure server-side.
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("audit_logs").insert({
      user_id: params.userId,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      action: params.action,
      old_data: params.oldData ?? null,
      new_data: params.newData ?? null,
    });

    if (error) {
      console.error("Failed to write audit log", error, params);
    }
  } catch (error) {
    console.error("Failed to write audit log", error, params);
  }
}
