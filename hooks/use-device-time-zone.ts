"use client";

import { useSyncExternalStore } from "react";

import { isValidTimeZone, modernTimeZoneId } from "@/lib/timezone";

const noopSubscribe = () => () => {};

function readDeviceTimeZone(): string | null {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return isValidTimeZone(zone) ? modernTimeZoneId(zone) : null;
}

/**
 * This device's IANA time zone, or null during server rendering (the server
 * runs in UTC and can't know it) -- so markup that depends on it never
 * causes a hydration mismatch.
 */
export function useDeviceTimeZone(): string | null {
  return useSyncExternalStore(noopSubscribe, readDeviceTimeZone, () => null);
}

function subscribeMinute(onChange: () => void) {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
}

/** The current minute as epoch ms (client only; null on the server). Re-renders when the minute changes. */
export function useCurrentMinute(): number | null {
  return useSyncExternalStore(
    subscribeMinute,
    () => Math.floor(Date.now() / 60_000) * 60_000,
    () => null
  );
}
