"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_ITEMS, SECONDARY_NAV_ITEMS } from "./nav-items";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-background md:flex">
      <div className="flex h-14 items-center gap-2 border-b px-5 font-semibold">
        <ClipboardCheck className="size-5 text-primary" />
        WorkLedger
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive(pathname, item.href)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t p-3">
        {SECONDARY_NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive(pathname, item.href)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
        <Link
          href="/help"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <HelpCircle className="size-4" />
          Help
        </Link>
      </div>
    </aside>
  );
}
