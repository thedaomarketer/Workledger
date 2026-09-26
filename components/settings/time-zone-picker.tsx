"use client";

import { useDeferredValue, useId, useMemo, useState } from "react";
import { Check, ChevronsUpDown, LocateFixed, Search } from "lucide-react";

import { useCurrentMinute, useDeviceTimeZone } from "@/hooks/use-device-time-zone";
import { fmt } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { formatUtcOffset, listTimeZones, modernTimeZoneId, timeZoneCity } from "@/lib/timezone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ZoneOption {
  id: string;
  city: string;
  /** "America / Argentina" -- the path above the city, for disambiguation. */
  region: string;
  offset: string;
  /** Lower-cased text the search box matches against. */
  haystack: string;
}

function buildOptions(): ZoneOption[] {
  const now = new Date();
  return listTimeZones().map((id) => {
    const parts = id.split("/");
    const city = timeZoneCity(id);
    const region = parts.slice(0, -1).join(" / ").replace(/_/g, " ");
    const offset = formatUtcOffset(id, now);
    return { id, city, region, offset, haystack: `${id} ${city} ${region} ${offset}`.toLowerCase() };
  });
}

/**
 * Searchable picker over every IANA time zone the browser knows. Submits the
 * chosen zone as a hidden `name` input; the server re-validates it.
 */
export function TimeZonePicker({
  name,
  defaultValue,
  labelId,
}: {
  name: string;
  defaultValue: string;
  /** id of the visible label, for the trigger's accessible name. */
  labelId: string;
}) {
  const { intl, m } = useI18n();
  const t = m.settings.region;
  const [value, setValue] = useState(() => modernTimeZoneId(defaultValue));
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const deviceZone = useDeviceTimeZone();
  const minute = useCurrentMinute();
  const listId = useId();

  // Offsets depend on the date (DST), so rebuild when the picker opens.
  const options = useMemo(() => (open ? buildOptions() : []), [open]);

  const filtered = useMemo(() => {
    const terms = deferredQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return options;
    return options.filter((option) => terms.every((term) => option.haystack.includes(term)));
  }, [options, deferredQuery]);

  const currentTime =
    minute === null
      ? null
      : new Date(minute).toLocaleTimeString(intl, { hour: "numeric", minute: "2-digit", timeZone: value });

  function choose(zone: string) {
    setValue(zone);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-labelledby={labelId}
        aria-describedby={`${listId}-current`}
        aria-haspopup="dialog"
        className="flex h-11 w-full items-center justify-between gap-2 rounded-xl bg-muted px-3.5 text-left text-base outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 md:text-sm"
      >
        <span className="min-w-0 truncate">
          {timeZoneCity(value)}
          <span className="ml-2 text-muted-foreground">{formatUtcOffset(value)}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>
      <p id={`${listId}-current`} className="text-xs text-muted-foreground">
        {value}
        {currentTime ? ` · ${fmt(t.currentTime, { time: currentTime })}` : ""}
      </p>
      {deviceZone && deviceZone !== value && (
        <Button type="button" variant="ghost" size="sm" className="-ml-2 h-9" onClick={() => setValue(deviceZone)}>
          <LocateFixed /> {t.useDevice} ({timeZoneCity(deviceZone)})
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85svh] flex-col gap-3 sm:max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{t.chooseTimezone}</DialogTitle>
            <DialogDescription>{t.timezoneHint}</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              aria-controls={listId}
              className="pl-10"
            />
          </div>
          {deviceZone && (
            <Button type="button" variant="outline" className="justify-start" onClick={() => choose(deviceZone)}>
              <LocateFixed /> {t.useDevice}
              <span className="ml-auto truncate text-muted-foreground">{timeZoneCity(deviceZone)}</span>
            </Button>
          )}
          <ul id={listId} className="-mx-2 min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <li className="px-2 py-8 text-center text-sm text-muted-foreground">
                {fmt(t.noMatches, { query: deferredQuery.trim() })}
              </li>
            ) : (
              filtered.map((option) => {
                const selected = option.id === value;
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => choose(option.id)}
                      aria-current={selected ? "true" : undefined}
                      className={cn(
                        "flex min-h-12 w-full items-center gap-3 rounded-xl px-2 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                        selected && "text-primary"
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium">{option.city}</span>
                        {option.region && (
                          <span className="block truncate text-xs text-muted-foreground">{option.region}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-sm text-muted-foreground tabular-nums">{option.offset}</span>
                      <Check className={cn("size-4 shrink-0", selected ? "opacity-100" : "opacity-0")} />
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
