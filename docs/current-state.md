# Current State

Last updated: 2026-09-19 (initial build).

This document describes what actually exists in the codebase today, as
opposed to what the product spec eventually calls for. See `docs/roadmap.md`
for what's next.

## What works end to end

- **Auth**: email/password registration, login, logout, password reset
  request + update, email confirmation callback (`app/auth/confirm`). Session
  refresh runs on every request via `proxy.ts` (Next.js 16's replacement for
  `middleware.ts`).
- **Database**: full schema applied to a live Supabase project (16
  migrations in `supabase/migrations/`) — `profiles`, `jobs`, `shifts`,
  `breaks`, `journal_entries`, `expenses`, `mileage_entries`,
  `schedule_entries`, `attachments`, `audit_logs`, `user_settings`,
  `ai_conversations`, `ai_messages`, plus a private `attachments` storage
  bucket. RLS is enabled and verified on every table (see `docs/security.md`).
- **Calculation engine** (`lib/calculations/`): shift duration, paid/unpaid
  break handling, overtime split, per-workweek/day/month bucketing in a
  user's timezone, integer-cents money math. 36 unit tests cover the edge
  cases the spec calls out by name (midnight-crossing shifts, long shifts,
  multiple/paid/unpaid breaks, missing clock-outs, DST spring-forward and
  fall-back, overlap detection, rounding).
- **Jobs**: create, edit, archive/restore, delete (blocked if referenced
  data exists), per-job weekly/monthly stats.
- **Time tracking**: clock in/out, start/end break, manual shift entry
  (validated against overlaps and shift/break ordering), shift history with
  edit/delete, one-active-shift-per-user enforced at the database level.
- **Dashboard**: greeting, active-shift card or clock-in prompt, today/week
  metrics, overtime, estimated earnings, recent activity feed, upcoming
  shifts.
- **Journal**: structured entries (task, incident, safety issue, etc.) with
  icons, optional job/shift linkage — the Work Evidence Timeline's data
  source. Rendered as a timeline on `/journal`; surfaced on the dashboard.
- **Expenses / Mileage**: full CRUD, monthly totals, category breakdown for
  expenses.
- **Reports**: date-range + totals (hours, overtime, earnings, expenses +
  mileage), per-job breakdown, CSV export for hours and expenses.
- **Settings**: profile fields, preferences (workweek start day, default
  break length, overtime threshold, notifications), full JSON data export,
  account deletion (cascades through every table via `on delete cascade`).
- **Calendar**: month view merging worked/active shifts and schedule
  entries.
- **Audit log**: every mutation from a server action writes an
  `audit_logs` row via the service-role client.

Verified directly against the live Supabase project (`WorkLedger`,
`hdeshlblsdsplpyayanz`) via SQL: the new-user trigger creates a profile and
default settings row, the one-active-shift constraint rejects a duplicate
clock-in, and RLS correctly hides one user's jobs/shifts/breaks from another
user while still exposing their own. `npm run lint`, `npm run typecheck`,
`npm test` (36/36), and `npm run build` all pass.

## What's stubbed or missing

- **AI Assistant** (`/assistant`): placeholder page only. No tool-calling
  layer, no `ai_conversations`/`ai_messages` writes yet. The tables and
  `docs/ai.md`'s design exist; the implementation doesn't.
- **Attachments/receipts**: the `attachments` table and private storage
  bucket + RLS policies exist, but there's no upload UI yet. Expenses have
  a `receipt_url` column that's currently unused.
- **Job detail tabs**: the spec describes Overview/Time/Journal/Expenses/Reports/Settings
  tabs per job. The current `/jobs/[id]` page is a single overview (stats +
  this month's shifts + edit), not tabbed.
- **PDF export**: only CSV export is implemented for reports.
- **Notifications**: `user_settings.notifications_enabled` exists as a
  preference, but no actual push/email notifications are sent.
- **Offline support / PWA**: not implemented.
- **E2E browser test**: Playwright is installed but no `tests/e2e/` suite
  exists yet, and the sandboxed build environment used for this initial
  build could not reach the live Supabase project's domain over the
  network (outbound egress is allowlisted per-environment), so the running
  app itself was never exercised in a real browser here. The full flow was
  instead verified at the database layer directly (see `docs/security.md`).
  Run `npm run dev` with `.env.local` filled in from a network that can
  reach `*.supabase.co` to do a real browser pass.
- **Monetization, teams/business features**: not started (Phase 8/9 in the
  original spec).

## Live Supabase project

- Project: `WorkLedger` (ref `hdeshlblsdsplpyayanz`, `us-east-1`), created
  under the same organization as the user's other projects, on the free
  tier.
- To free up a project slot, `gloworganicatelier@gmail.com's Project` was
  paused (with explicit user confirmation) — it can be resumed from the
  Supabase dashboard at any time.
- `.env.local` (gitignored) has the real project URL and anon key wired up.
  `SUPABASE_SERVICE_ROLE_KEY` is a placeholder — fill in the real value from
  the Supabase dashboard's API settings before using account deletion or
  relying on audit logging locally.
