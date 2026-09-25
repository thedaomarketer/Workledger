"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Car, Clock, Plus, Receipt, BookText, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface CreateAction {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

const CREATE_ACTIONS: CreateAction[] = [
  { href: "/time?new=shift", label: "Log a shift", description: "Add a completed shift manually", icon: Clock },
  { href: "/expenses?new=1", label: "Add expense", description: "Record a work-related cost", icon: Receipt },
  { href: "/mileage?new=1", label: "Add mileage", description: "Log a work trip", icon: Car },
  { href: "/journal?new=1", label: "New journal entry", description: "Note a task, issue, or instruction", icon: BookText },
  { href: "/jobs?new=1", label: "Add a job", description: "Track time for a new employer or gig", icon: Briefcase },
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {variant === "fab" ? (
          <button
            type="button"
            aria-label="Create"
            className="relative -top-5 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
          >
            <Plus className="size-6" />
          </button>
        ) : (
          <Button className="w-full justify-start gap-2">
            <Plus /> Create
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-xl pb-[max(1rem,env(safe-area-inset-bottom))]">
        <SheetHeader>
          <SheetTitle>Create</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-1 px-4 pb-2">
          {CREATE_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent">
                <action.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{action.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{action.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
