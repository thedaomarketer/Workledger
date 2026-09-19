import Link from "next/link";
import { ClipboardCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 font-semibold text-lg">
        <ClipboardCheck className="size-6 text-primary" />
        WorkLedger
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
