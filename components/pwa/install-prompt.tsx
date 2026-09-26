"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/client";

const DISMISSED_KEY = "workledger:install-prompt-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

export function InstallPrompt() {
  const { m } = useI18n();
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasDismissed()) return;

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Best-effort only; worst case the prompt reappears next visit.
    }
  }

  async function install() {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    await deferredEvent.userChoice;
    setDeferredEvent(null);
    dismiss();
  }

  if (!visible || !deferredEvent) return null;

  return (
    <div className="flex items-center gap-3 border-b bg-accent/50 px-4 py-2.5 text-sm">
      <Download className="size-4 shrink-0 text-muted-foreground" />
      <p className="flex-1 text-accent-foreground">
        {m.pwa.installPrompt}
      </p>
      <Button size="sm" onClick={install}>
        {m.pwa.install}
      </Button>
      <button
        type="button"
        onClick={dismiss}
        aria-label={m.common.dismiss}
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
