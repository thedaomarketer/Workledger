"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import { CreateMenu } from "./create-menu";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const PRIMARY = NAV_ITEMS.filter((item) => item.mobile);
const SPLIT = Math.ceil(PRIMARY.length / 2);
const LEFT_ITEMS = PRIMARY.slice(0, SPLIT);
const RIGHT_ITEMS = PRIMARY.slice(SPLIT);

export function MobileNav() {
  const pathname = usePathname();
  const moreActive = NAV_ITEMS.some(
    (item) => !item.mobile && isActive(pathname, item.href)
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t bg-background md:hidden">
      {LEFT_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
            isActive(pathname, item.href) ? "text-primary" : "text-muted-foreground"
          )}
        >
          <item.icon className="size-5" />
          {item.label}
        </Link>
      ))}

      <div className="flex flex-1 items-center justify-center">
        <CreateMenu variant="fab" />
      </div>

      {RIGHT_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
            isActive(pathname, item.href) ? "text-primary" : "text-muted-foreground"
          )}
        >
          <item.icon className="size-5" />
          {item.label}
        </Link>
      ))}

      <Link
        href="/more"
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
          moreActive ? "text-primary" : "text-muted-foreground"
        )}
      >
        <MoreHorizontal className="size-5" />
        More
      </Link>
    </nav>
  );
}
