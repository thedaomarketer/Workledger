"use client";

import { useState, useTransition } from "react";
import { Globe, X } from "lucide-react";
import { toast } from "sonner";

import { useDeviceTimeZone } from "@/hooks/use-device-time-zone";
import { updateTimeZoneAction } from "@/lib/actions/settings";
import { fmt } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { timeZoneCity } from "@/lib/timezone";
import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "workledger:tz-prompt-dismissed";

function wasDismissed(zone: string): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === zone;
  } catch {
    return false;
  }
}

/**
 * Offers a one-tap switch when the account is still on the UTC default but
 * this device reports a real zone -- accounts created before signup captured
 * the zone, or where the browser didn't report one. Deliberately silent for
 * anyone who picked a zone themselves, so travelling doesn't nag.
 */
export function TimeZonePrompt({ savedTimeZone }: { savedTimeZone: string }) {
  const { m } = useI18n();
  const deviceZone = useDeviceTimeZone();
  const [hidden, setHidden] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (
    hidden ||
    savedTimeZone !== "UTC" ||
    !deviceZone ||
    deviceZone === "UTC" ||
    deviceZone === "Etc/UTC" ||
    wasDismissed(deviceZone)
  ) {
    return null;
  }

  const zone = timeZoneCity(deviceZone);

  function dismiss() {
    setHidden(true);
    try {
      localStorage.setItem(DISMISSED_KEY, deviceZone!);
    } catch {
      // Best-effort only; worst case the prompt reappears next visit.
    }
  }

  return (
    <div role="region" aria-label={m.settings.region.timezone} className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-accent/50 px-4 py-2.5 text-sm">
      <Globe className="size-4 shrink-0 text-muted-foreground" />
      <p className="min-w-[14rem] flex-1 text-accent-foreground">{fmt(m.timezonePrompt.message, { zone })}</p>
      <div className="ml-auto flex items-center gap-1">
        <Button
          size="sm"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await updateTimeZoneAction(deviceZone);
              if (result.error) {
                toast.error(result.error);
              } else {
                toast.success(m.timezonePrompt.updated);
                setHidden(true);
              }
            })
          }
        >
          {fmt(m.timezonePrompt.useIt, { zone })}
        </Button>
        <button
          type="button"
          onClick={dismiss}
          aria-label={m.timezonePrompt.notNow}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
