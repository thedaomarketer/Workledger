import {
  AlertTriangle,
  Calendar,
  CircleDollarSign,
  Coffee,
  FileText,
  type LucideIcon,
  MessageSquare,
  ShieldAlert,
  Siren,
  Megaphone,
  CheckSquare,
} from "lucide-react";
import type { EntryType } from "@/lib/supabase/database.types";
import type { Messages } from "@/lib/i18n/messages/en";

export const ENTRY_TYPE_CONFIG: Record<EntryType, { icon: LucideIcon; className: string }> = {
  general: { icon: MessageSquare, className: "text-muted-foreground" },
  task: { icon: CheckSquare, className: "text-blue-600" },
  instruction: { icon: Megaphone, className: "text-blue-600" },
  workplace_issue: { icon: AlertTriangle, className: "text-amber-600" },
  safety_issue: { icon: ShieldAlert, className: "text-destructive" },
  schedule_change: { icon: Calendar, className: "text-purple-600" },
  pay_issue: { icon: CircleDollarSign, className: "text-amber-600" },
  break_issue: { icon: Coffee, className: "text-amber-600" },
  incident: { icon: Siren, className: "text-destructive" },
  other: { icon: FileText, className: "text-muted-foreground" },
};

export const ENTRY_TYPES = Object.keys(ENTRY_TYPE_CONFIG) as EntryType[];

/** Translated label for a journal entry type; unknown values fall back to "Other". */
export function journalTypeLabel(type: string, m: Messages): string {
  return m.journal.types[type as EntryType] ?? m.journal.types.other;
}

