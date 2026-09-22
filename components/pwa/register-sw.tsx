"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline shell caching is a progressive enhancement -- if
      // registration fails (unsupported browser, blocked storage), the app
      // still works fully online.
    });
  }, []);

  return null;
}
