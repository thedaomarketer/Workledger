"use client";

import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight">WorkLedger hit a snag</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Something went wrong loading the app. Your data is safe -- please try again.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
