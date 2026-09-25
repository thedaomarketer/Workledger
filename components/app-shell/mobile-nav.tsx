"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavItem } from "./nav-items";
import { CreateMenu } from "./create-menu";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const MORE_TAB: NavItem = { href: "/more", label: "More", icon: MoreHorizontal };
const TABS = [...NAV_ITEMS.filter((item) => item.mobile), MORE_TAB];
const LEFT_TABS = TABS.slice(0, 2);
const RIGHT_TABS = TABS.slice(2, 4);

function Tab({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "mx-1 flex h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground active:bg-black/5"
      )}
    >
      <item.icon className="size-[22px]" strokeWidth={active ? 2.25 : 1.75} />
      {item.label}
    </Link>
  );
}

/**
 * Floating frosted tab bar (iOS style). An equal-width five-column grid with
 * the "+" button in column three keeps it exactly centered on screen,
 * regardless of label widths -- which is why exactly four tabs are allowed
 * (see `NavItem.mobile`).
 */
export function MobileNav() {
  const pathname = usePathname();
  const moreActive =
    isActive(pathname, "/more") || NAV_ITEMS.some((item) => !item.mobile && isActive(pathname, item.href));

  const activeFor = (item: NavItem) => (item === MORE_TAB ? moreActive : isActive(pathname, item.href));

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="glass pointer-events-auto mx-auto grid h-16 max-w-md grid-cols-5 items-center rounded-full border border-white/70 shadow-[0_8px_32px_rgb(0_0_0/0.12)]">
        {LEFT_TABS.map((item) => (
          <Tab key={item.href} item={item} active={activeFor(item)} />
        ))}
        <div className="flex justify-center">
          <CreateMenu variant="fab" />
        </div>
        {RIGHT_TABS.map((item) => (
          <Tab key={item.href} item={item} active={activeFor(item)} />
        ))}
      </div>
    </nav>
  );
}
