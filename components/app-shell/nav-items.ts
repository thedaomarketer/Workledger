import type { LucideIcon } from "lucide-react";
import {
  BookText,
  CalendarDays,
  Clock,
  LayoutDashboard,
  Briefcase,
  Car,
  Receipt,
  Sparkles,
  BarChart3,
  Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  mobile?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, mobile: true },
  { href: "/time", label: "Time", icon: Clock, mobile: true },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, mobile: true },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/journal", label: "Journal", icon: BookText },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/mileage", label: "Mileage", icon: Car },
  { href: "/reports", label: "Reports", icon: BarChart3, mobile: true },
  { href: "/assistant", label: "AI Assistant", icon: Sparkles },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
];
