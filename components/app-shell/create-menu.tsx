"use client";

import { useState } from "react";
import Link from "next/link";
import { BookText, Briefcase, Car, ChevronRight, Clock, Plus, Receipt, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useI18n } from "@/lib/i18n/client";
import type { Messages } from "@/lib/i18n/messages/en";

type CreateMessageKey = keyof Messages["createMenu"];

interface CreateAction {
  href: string;
  label: CreateMessageKey;
  description: CreateMessageKey;
  icon: LucideIcon;
  /** Literal Tailwind class for the icon tile (iOS Settings-style). */
  tileClassName: string;
}

const CREATE_ACTIONS: CreateAction[] = [
  { href: "/time?new=shift", label: "logShift", description: "logShiftDescription", icon: Clock, tileClassName: "bg-[#0071e3]" },
  { href: "/expenses?new=1", label: "addExpense", description: "addExpenseDescription", icon: Receipt, tileClassName: "bg-[#248a3d]" },
  { href: "/mileage?new=1", label: "addMileage", description: "addMileageDescription", icon: Car, tileClassName: "bg-[#c93400]" },
  { href: "/journal?new=1", label: "journalEntry", description: "journalEntryDescription", icon: BookText, tileClassName: "bg-[#8944ab]" },
  { href: "/jobs?new=1", label: "addJob", description: "addJobDescription", icon: Briefcase, tileClassName: "bg-[#5856d6]" },
];

/**
 * The quick-create entry point: a floating action button on mobile (in
 * `MobileNav`), a plain button on desktop (in `SidebarNav`). Both open the
 * same sheet of shortcuts, each deep-linking to the page that already owns
 * the relevant create dialog (via a `?new=` param the dialog reads on
 * mount) rather than duplicating any of that form/validation logic here.
 */
export function CreateMenu({ variant }: { variant: "fab" | "button" }) {
  const [open, setOpen] = useState(false);
  const { m } = useI18n();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {variant === "fab" ? (
          <button
            type="button"
            aria-label={m.createMenu.create}
            className="flex size-14 -translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_20px_rgb(0_113_227/0.4)] ring-4 ring-background transition-transform duration-150 active:scale-90"
          >
            <Plus className="size-7" strokeWidth={2.5} />
          </button>
        ) : (
          <Button className="w-full">
            <Plus /> {m.createMenu.create}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <SheetHeader className="px-5 pt-1 pb-0">
          <SheetTitle className="text-xl font-bold tracking-tight">{m.createMenu.title}</SheetTitle>
          <SheetDescription>{m.createMenu.description}</SheetDescription>
        </SheetHeader>
        <div className="mx-4 overflow-hidden rounded-2xl bg-muted">
          {CREATE_ACTIONS.map((action, i) => (
            <Link
              key={action.href}
              href={action.href}
              onClick={() => setOpen(false)}
              className="flex min-h-14 items-center gap-3 pl-3.5 transition-colors hover:bg-black/[0.03] active:bg-black/5"
            >
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-[9px] text-white ${action.tileClassName}`}>
                <action.icon className="size-[18px]" />
              </span>
              {/* Inset separator: starts after the icon tile, like iOS grouped lists. */}
              <span
                className={`flex min-w-0 flex-1 items-center gap-2 self-stretch py-2.5 pr-3.5 ${i > 0 ? "border-t border-black/[0.06]" : ""}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium">{m.createMenu[action.label]}</span>
                  <span className="block truncate text-xs text-muted-foreground">{m.createMenu[action.description]}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
              </span>
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
