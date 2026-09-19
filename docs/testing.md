# Testing

## Unit tests (Vitest)

`tests/unit/calculations/` — 36 tests covering every edge case the product
spec calls out by name:

- `duration.test.ts`: midnight-crossing shift, long (15h) shift, multiple
  unpaid breaks summing correctly, paid breaks not reducing paid time,
  unpaid breaks reducing paid time, missing clock-out (incomplete shift),
  a break still open at clock-out getting clamped to the shift end,
  **DST spring-forward** (1 real hour reported correctly, not 2 nominal
  hours), **DST fall-back** (2 real hours reported correctly, not 1),
  shift overlap detection, shift/break time validation.
- `overtime.test.ts`: regular/overtime split at a threshold, overtime
  disabled, a full "$24/hr, OT after 44h/week" scenario, explicit vs.
  fallback overtime rate, float-drift resistance over 100 fractional-hour
  shifts.
- `money.test.ts`: dollar/cent round-tripping, partial-hour earnings,
  cent rounding, currency formatting.
- `workweek.test.ts`: Monday-start and Sunday-start workweek bounds, a
  workweek that spans a DST transition (169 hours instead of 168), shift
  grouping.
- `period.test.ts`: local day and month bounds in a given timezone.
- `summary.test.ts`: aggregating multiple shifts per job with overtime
  applied once to the total, excluding incomplete shifts, keeping separate
  jobs independent.

Run: `npm test` (or `npm run test:watch`).

## Database-level verification

Because the build sandbox couldn't reach the live Supabase project's API
over the network, the golden path and RLS were verified with direct SQL
against the live database instead of through the running app. See
`docs/database.md`'s "Verifying RLS and constraints" section for exactly
what was run and what it proved (new-user trigger, duplicate-clock-in
rejection, paid-minutes math matching the calculation engine, cross-user
isolation).

**This is not a substitute for real browser testing.** Before shipping,
run `npm run dev` from a network that can reach `*.supabase.co`, fill in
`.env.local` with real Supabase project credentials, and walk the full
flow: register → confirm email → create job → clock in → break → clock out
→ view dashboard/reports → journal entry → expense → mileage → export data
→ log out → log back in → confirm data persisted → confirm a second
account can't see it.

## Static checks

```
npm run lint       # ESLint (flat config, Next.js 16's plugin defaults)
npm run typecheck   # tsc --noEmit, strict mode
npm run build       # next build — also runs TypeScript checking
```

All three currently pass cleanly.

## What's missing

- No integration tests against a real (or local) Supabase instance from
  the app layer — only the unit-tested calculation engine and the direct
  SQL verification above.
- No `tests/e2e/` Playwright suite yet, though Playwright is installed
  (`npm run test:e2e` is wired up in `package.json` once specs exist).
- No accessibility audit tooling wired into CI.

## Adding tests for new work

- Pure logic (anything that could live in `lib/calculations/`) gets a
  Vitest unit test — no mocking required, since the module has no
  dependency on Next.js, React, or Supabase.
- Server actions (`lib/actions/`) are harder to unit test in isolation
  since they call `createClient()` from `lib/supabase/server.ts`, which
  needs a request context. Prefer extracting any non-trivial logic into
  `lib/calculations/` or `lib/validation/` and unit-testing that; cover the
  action itself via an E2E test once the suite exists.
