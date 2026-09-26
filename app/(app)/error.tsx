"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/client";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const { m } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-6 text-destructive" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">{m.errorPage.title}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {m.errorPage.body}
        </p>
      </div>
      <div className="mt-2 flex gap-2">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          {m.errorPage.goToDashboard}
        </Button>
        <Button onClick={reset}>{m.errorPage.tryAgain}</Button>
      </div>
    </div>
  );
}
