"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-6 text-destructive" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          We couldn&apos;t load this page. Your recorded hours and data are safe -- try again, or head back to
          the dashboard.
        </p>
      </div>
      <div className="mt-2 flex gap-2">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Go to dashboard
        </Button>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
