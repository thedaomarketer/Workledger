import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  BookText,
  ClipboardCheck,
  Clock,
  Download,
  Landmark,
  Lock,
  Receipt,
  Smartphone,
  Sparkles,
  Trash2,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "WorkLedger — Your complete record of work",
  description:
    "Track shifts, breaks, earnings, overtime, expenses, and work notes in one place. Know what you've worked and what you're owed.",
};

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
  /** Literal Tailwind class for the icon tile. */
  tile: string;
}

const FEATURES: Feature[] = [
  {
    icon: Clock,
    title: "One-tap clock in",
    body: "Start, pause for breaks, and clock out in a tap. Overnight shifts and daylight-saving changes are handled for you.",
    tile: "bg-[#0071e3]",
  },
  {
    icon: Wallet,
    title: "Earnings & overtime",
    body: "See estimated pay as you work, with overtime applied at each job's own rate and weekly threshold.",
    tile: "bg-[#248a3d]",
  },
  {
    icon: Landmark,
    title: "Payday & tax estimates",
    body: "Know when payday is and roughly what's withheld, for Canada and the US, by province, state, or city.",
    tile: "bg-[#5856d6]",
  },
  {
    icon: BookText,
    title: "Work journal",
    body: "Log tasks, instructions, incidents, and safety issues with timestamps, building a record you can rely on.",
    tile: "bg-[#8944ab]",
  },
  {
    icon: Receipt,
    title: "Expenses & mileage",
    body: "Keep work costs and trips right next to your hours, by job and category.",
    tile: "bg-[#c93400]",
  },
  {
    icon: BarChart3,
    title: "Reports & charts",
    body: "Weekly trends, per-job breakdowns, and CSV export whenever you need them.",
    tile: "bg-[#0e7c86]",
  },
  {
    icon: Sparkles,
    title: "AI assistant",
    body: "Ask “how many hours did I work last week?” and get answers from your own records, never guesses.",
    tile: "bg-[#d1276b]",
  },
  {
    icon: Smartphone,
    title: "Built for your phone",
    body: "Install WorkLedger to your home screen and use it like an app, one thumb, on the go.",
    tile: "bg-[#48484a]",
  },
];

const PRIVACY_POINTS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Lock, title: "Private by default", body: "Every record is locked to your account at the database level." },
  { icon: Download, title: "Export anytime", body: "Download everything you've recorded, whenever you want." },
  { icon: Trash2, title: "Delete for good", body: "Close your account and all of your data is permanently removed." },
];

function AppIcon({ className = "size-8" }: { className?: string }) {
  return (
    <span
      className={`flex items-center justify-center rounded-[27%] bg-primary text-primary-foreground shadow-[0_4px_12px_rgb(0_113_227/0.3)] ${className}`}
    >
      <ClipboardCheck className="size-[55%]" />
    </span>
  );
}

/** A static, illustrative rendering of the app (not real data). */
function PhoneMockup() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-[280px] select-none sm:w-[300px]">
      <div className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(0_113_227/0.25),transparent)] blur-2xl" />
      <div className="rounded-[48px] bg-[#1c1c1e] p-3 shadow-[0_30px_80px_rgb(0_0_0/0.25)]">
        <div className="relative overflow-hidden rounded-[38px] bg-background px-4 pt-10 pb-6">
          <div className="absolute top-3 left-1/2 h-6 w-24 -translate-x-1/2 rounded-full bg-[#1c1c1e]" />
          <p className="text-[11px] text-muted-foreground">Tuesday, June 11</p>
          <p className="text-xl font-bold tracking-tight">Good morning, Sam</p>

          <div className="mt-4 rounded-2xl bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[11px] font-medium text-success">
              <span className="size-2 animate-pulse rounded-full bg-success" /> Clocked in · Maple Restaurant
            </div>
            <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">3:42:18</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <span className="rounded-full bg-secondary py-2 text-center text-[11px] font-semibold text-primary">
                Start break
              </span>
              <span className="rounded-full bg-primary py-2 text-center text-[11px] font-semibold text-primary-foreground">
                Clock out
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-card p-3 shadow-sm">
              <p className="text-[10px] text-muted-foreground">This week</p>
              <p className="text-lg font-bold tracking-tight">32h 15m</p>
            </div>
            <div className="rounded-2xl bg-card p-3 shadow-sm">
              <p className="text-[10px] text-muted-foreground">Est. earnings</p>
              <p className="text-lg font-bold tracking-tight">$774.00</p>
            </div>
          </div>

          <div className="mt-3 rounded-2xl bg-card p-3 shadow-sm">
            <p className="text-[10px] text-muted-foreground">Hours by week</p>
            <div className="mt-2 flex h-16 items-end gap-2">
              {[45, 70, 55, 90, 62].map((h, i) => (
                <div key={i} className="flex flex-1 flex-col-reverse gap-0.5">
                  <div className="rounded-t-[3px] bg-chart-1" style={{ height: `${h * 0.55}px` }} />
                  {i === 3 && <div className="rounded-t-[3px] bg-chart-2" style={{ height: "8px" }} />}
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-foreground/80" />
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="relative flex min-h-svh flex-col overflow-x-clip">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(60%_50%_at_20%_0%,rgb(0_113_227/0.14),transparent),radial-gradient(50%_45%_at_85%_10%,rgb(137_68_171/0.12),transparent)]"
      />

      <header className="glass sticky top-0 z-30 border-b border-black/[0.06] pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-[17px] font-semibold tracking-tight">
            <AppIcon className="size-7" />
            WorkLedger
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-12 pb-16 sm:px-6 md:pt-20 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:pb-24">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="size-1.5 rounded-full bg-success" />
              Time tracking for real workers
            </span>
            <h1 className="mt-5 text-[44px] leading-[1.05] font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Every hour.
              <br />
              Every dollar.
              <br />
              <span className="bg-gradient-to-r from-[#0071e3] to-[#8944ab] bg-clip-text text-transparent">
                On the record.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground lg:mx-0">
              WorkLedger keeps your shifts, breaks, earnings, expenses, and work notes in one place, so you always
              know what you&apos;ve worked and what you&apos;re owed.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/register">
                  Create your account <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
          </div>
          <PhoneMockup />
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything about your work, in one app.</h2>
            <p className="mt-3 text-muted-foreground">
              Built around the questions you actually ask: Am I on the clock? How long have I worked? What have I
              earned?
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 rounded-3xl bg-card p-5 shadow-[0_1px_2px_rgb(0_0_0/0.04)] sm:block sm:p-6"
              >
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-[12px] text-white ${feature.tile}`}
                >
                  <feature.icon className="size-[22px]" />
                </span>
                <div>
                  <h3 className="font-semibold tracking-tight sm:mt-4">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:mt-1.5">{feature.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="rounded-[32px] bg-[#1c1c1e] px-6 py-12 text-white sm:px-12">
            <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">Your records are yours.</h2>
            <p className="mt-3 max-w-xl text-white/70">
              Work records can be sensitive. WorkLedger is built so that only you can see yours, and you&apos;re
              always free to take them with you.
            </p>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {PRIVACY_POINTS.map((point) => (
                <div key={point.title}>
                  <point.icon className="size-6 text-[#64d2ff]" />
                  <h3 className="mt-3 font-semibold">{point.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{point.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-8 pb-24 text-center sm:px-6">
          <AppIcon className="mx-auto size-16" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Start your record today.</h2>
          <p className="mt-3 text-muted-foreground">It takes less than a minute to set up your first job.</p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/register">
              Get started <ArrowRight />
            </Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-black/[0.06] pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>&copy; {new Date().getFullYear()} WorkLedger</p>
          <div className="flex gap-5">
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
