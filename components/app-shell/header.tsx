import { LogOut, Settings, User as UserIcon } from "lucide-react";

import { signOutAction } from "@/lib/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

function initials(name: string | null, email: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return (email ?? "?").slice(0, 2).toUpperCase();
}

export function Header({
  fullName,
  email,
}: {
  fullName: string | null;
  email: string | null;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="font-semibold md:hidden">WorkLedger</div>
      <div className="hidden md:block" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="size-8">
              <AvatarFallback>{initials(fullName, email)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm">
            <p className="font-medium">{fullName ?? "Your account"}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <UserIcon /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={signOutAction}>
            <DropdownMenuItem asChild variant="destructive">
              <button type="submit" className="w-full">
                <LogOut /> Log out
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
