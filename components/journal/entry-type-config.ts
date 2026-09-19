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

export const ENTRY_TYPE_CONFIG: Record<EntryType, { label: string; icon: LucideIcon; className: string }> = {
  general: { label: "Note", icon: MessageSquare, className: "text-muted-foreground" },
  task: { label: "Task", icon: CheckSquare, className: "text-blue-600" },
  instruction: { label: "Instruction", icon: Megaphone, className: "text-blue-600" },
  workplace_issue: { label: "Workplace issue", icon: AlertTriangle, className: "text-amber-600" },
  safety_issue: { label: "Safety issue", icon: ShieldAlert, className: "text-destructive" },
  schedule_change: { label: "Schedule change", icon: Calendar, className: "text-purple-600" },
  pay_issue: { label: "Pay issue", icon: CircleDollarSign, className: "text-amber-600" },
  break_issue: { label: "Break issue", icon: Coffee, className: "text-amber-600" },
  incident: { label: "Incident", icon: Siren, className: "text-destructive" },
  other: { label: "Other", icon: FileText, className: "text-muted-foreground" },
};

export const ENTRY_TYPE_OPTIONS = Object.entries(ENTRY_TYPE_CONFIG) as [EntryType, (typeof ENTRY_TYPE_CONFIG)[EntryType]][];
