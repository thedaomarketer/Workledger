import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <WifiOff className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">You&apos;re offline</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          WorkLedger needs a connection to load your hours, jobs, and earnings safely. Reconnect and try
          again -- nothing has been lost.
        </p>
      </div>
      <a
        href="/dashboard"
        className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground"
      >
        Try again
      </a>
    </div>
  );
}
