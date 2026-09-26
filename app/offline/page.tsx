import { WifiOff } from "lucide-react";

import { getI18n } from "@/lib/i18n/server";

export default async function OfflinePage() {
  const { m } = await getI18n();
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <WifiOff className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">{m.offline.title}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {m.offline.body}
        </p>
      </div>
      <a
        href="/dashboard"
        className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
      >
        {m.offline.tryAgain}
      </a>
    </div>
  );
}
