import Link from "next/link";

import { NAV_ITEMS, SECONDARY_NAV_ITEMS } from "@/components/app-shell/nav-items";
import { HelpCircle } from "lucide-react";

// Mobile-only "More" screen, listing the nav items that don't fit in the
// bottom tab bar (see components/app-shell/mobile-nav.tsx).
export default function MorePage() {
  const items = [...NAV_ITEMS.filter((item) => !item.mobile), ...SECONDARY_NAV_ITEMS];

  return (
    <div className="space-y-2 md:hidden">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">More</h1>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium"
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      ))}
      <Link href="/help" className="flex items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium">
        <HelpCircle className="size-4" />
        Help
      </Link>
    </div>
  );
}
