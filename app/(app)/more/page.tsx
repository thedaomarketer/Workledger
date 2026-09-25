import Link from "next/link";
import { ChevronRight, HelpCircle } from "lucide-react";

import { NAV_ITEMS, SECONDARY_NAV_ITEMS, type NavItem } from "@/components/app-shell/nav-items";

const HELP_ITEM: NavItem = { href: "/help", label: "Help", icon: HelpCircle };

function Group({ items }: { items: NavItem[] }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-card">
      {items.map((item, i) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex min-h-12 items-center gap-3 pl-4 transition-colors active:bg-black/5"
        >
          <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[8px] bg-primary text-primary-foreground">
            <item.icon className="size-[17px]" />
          </span>
          <span
            className={`flex flex-1 items-center self-stretch pr-4 text-[15px] ${i > 0 ? "border-t border-black/[0.06]" : ""}`}
          >
            <span className="flex-1">{item.label}</span>
            <ChevronRight className="size-4 text-muted-foreground/60" />
          </span>
        </Link>
      ))}
    </div>
  );
}

// Mobile-only "More" screen, listing the nav items that don't fit in the
// bottom tab bar (see components/app-shell/mobile-nav.tsx).
export default function MorePage() {
  return (
    <div className="space-y-6 md:hidden">
      <h1 className="text-[28px] leading-tight font-bold tracking-tight">More</h1>
      <Group items={NAV_ITEMS.filter((item) => !item.mobile)} />
      <Group items={[...SECONDARY_NAV_ITEMS, HELP_ITEM]} />
    </div>
  );
}
