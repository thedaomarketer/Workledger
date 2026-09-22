# Roadmap

Status as of this build. See `docs/current-state.md` for the detailed
"what works / what's stubbed" breakdown.

## Done

- **Phase 0 — Foundation**: Next.js 16 + TypeScript + Tailwind v4 +
  hand-built shadcn-style components, Supabase project provisioned, full
  schema + RLS applied and verified, CI-equivalent checks (lint, typecheck,
  test, build) all pass.
- **Phase 1 — Core Time Tracking**: jobs CRUD, clock in/out, breaks,
  manual shift entry, shift history, calculation engine with 36 unit
  tests.
- **Phase 2 — Dashboard**: today/week/month hours, overtime, estimated
  earnings, recent activity, upcoming shifts.
- **Phase 3 — Work Records** (partial): journal entries with types/icons,
  rendered as a timeline. Attachments table + private storage bucket exist
  but have no upload UI. No dedicated audit-history UI yet (the data is
  captured in `audit_logs`).
- **Phase 4 — Money**: overtime calculation, expenses, mileage, earnings
  baked into the dashboard and reports.
- **Phase 5 — Reports** (partial): hours/earnings/overtime/expense
  reports with job and date-range filters, CSV export. No PDF export.
- **Phase 6 — AI**: implemented. Chat assistant at `/assistant`, backed by
  Claude with 9 read-only tools scoped to the user's own data. See
  `docs/ai.md`.
- **Deployed**: live on Vercel at https://workledger-three.vercel.app.

## Not started

- **Tax withholding breakdown**: estimate what's withheld from pay based
  on the user's country (Canada or US) and province/state (+ city where
  applicable), and surface it alongside upcoming payday. Not yet designed
  in a doc -- next up.
- **Billing/subscriptions**: Stripe integration for the Free/Pro/Business
  plans described in the original spec, using the already-connected
  "Di Juicy Oasis" Stripe account. Not started.
- **Phase 7 — Mobile/PWA**: responsive mobile UI exists (bottom nav,
  card-based layouts); no offline support, no push notifications, no PWA
  manifest/service worker.
- **Phase 8 — Monetization**: not started. No Stripe integration, no plan
  gating.
- **Phase 9 — Business/Teams**: not started.

## Immediate next steps, in priority order

Following the original spec's priority order (never trade data integrity
for polish):

1. **P0** — Run a real browser E2E pass against the live Supabase project
   from a network that can reach it (the build sandbox couldn't). Fill in
   the real `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` first so account
   deletion and audit logging work locally too.
2. **P0** — Add a `tests/e2e/` Playwright suite covering the critical flow
   (register → job → clock in/break/out → dashboard → report → export →
   logout/login).
3. **P1** — Job detail tabs (Overview/Time/Journal/Expenses/Reports) to
   match the spec's per-job navigation, rather than the current single
   overview page.
4. **P1** — Attachment upload UI (receipts on expenses, files on journal
   entries), wired to the existing private bucket + signed URLs.
5. **P2** — PDF export for reports.
6. **P2** — Tax withholding breakdown (Canada + US), tied to upcoming
   payday awareness.
7. **P2** — Billing/subscriptions (Stripe).
8. **P3** — Notifications (shift/clock-in/clock-out/break reminders,
   weekly summary) — `user_settings.notifications_enabled` already exists
   as the preference toggle.
9. **P3** — PWA / offline support for the clock-in flow specifically (the
   spec calls out that a clock-in must never be silently lost to a network
   drop).
10. **P4** — Team/business features.
