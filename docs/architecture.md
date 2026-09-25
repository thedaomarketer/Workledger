# Architecture

## Stack

- **Next.js 16** (App Router, Turbopack by default, `proxy.ts` instead of
  `middleware.ts`, async `params`/`searchParams`)
- **React 19.2**
- **TypeScript** (strict mode)
- **Tailwind CSS v4** (CSS-first config in `app/globals.css`, no
  `tailwind.config.js`)
- **shadcn/ui-style components** hand-built in `components/ui/` (the
  shadcn CLI's registry was unreachable from the build sandbox, so the
  "new-york" style primitives were written directly, matching the same
  conventions — `components.json` documents the intended CLI config for
  future use)
- **Supabase**: Postgres, Auth, Storage, Row Level Security
- **Zod v4** for validation
- **Vitest** for unit tests, **Playwright** installed for future E2E
- **date-fns / date-fns-tz** for timezone-correct date math
- **papaparse** for CSV export

## Directory layout

```
app/
  (auth)/           login, register, reset-password, update-password
  auth/confirm/     email OTP / confirmation callback (route handler)
  (app)/            authenticated app shell + all feature pages
  api/               CSV export + account data export route handlers
components/
  ui/               hand-built shadcn-style primitives
  app-shell/        sidebar, mobile nav, header
  <domain>/         jobs/, time/, journal/, expenses/, mileage/, settings/
lib/
  calculations/     pure, framework-free business logic (see below)
  supabase/         client/server/admin factories + hand-written DB types
  actions/          "use server" mutations, one file per domain
  data/             read-side data fetching for Server Components
  validation/       Zod schemas
  audit/            audit_logs writer
supabase/
  migrations/       numbered SQL migrations, applied directly via the
                     Supabase MCP tools during this build (also valid
                     input to `supabase db push` with the Supabase CLI)
tests/unit/         Vitest specs, mirroring lib/calculations/
```

## The calculation engine is the source of truth

`lib/calculations/` has no dependency on Next.js, React, or Supabase — it's
plain TypeScript operating on `Date`/ISO-string instants and plain objects.
This is deliberate:

- It's the only place duration, overtime, and money math happens. Server
  actions and data-fetching code call into it; nothing recomputes totals
  ad hoc in a component.
- It's fully unit-testable without mocking a database or a framework (see
  `tests/unit/calculations/`).
- Because it works on absolute instants rather than "local" date strings,
  DST and time zone changes are correct by construction — see
  `duration.ts`'s and `workweek.ts`'s DST test cases.

Money is always integer cents internally (`money.ts`); the UI only
formats cents to a currency string at render time.

## Data flow

- **Reads**: Server Components call `lib/data/*.ts` helpers directly
  (server-only, use the request-scoped Supabase client from
  `lib/supabase/server.ts`), which query Postgres and hand plain rows to
  `lib/calculations/*` for aggregation before rendering.
- **Writes**: Client Components submit to `"use server"` actions in
  `lib/actions/*.ts` via `useActionState` (for forms) or a direct call
  wrapped in `useTransition` (for one-off actions like clock in/out). Every
  action re-authenticates via `supabase.auth.getUser()`, validates input
  with Zod, writes through the request-scoped (RLS-enforced) client, then
  writes an audit log entry through the service-role client, then calls
  `revalidatePath`.
- **Admin/service-role access** (`lib/supabase/admin.ts`) is used only for
  audit logging and account deletion — both are trusted, server-only
  operations that need to act after the request is already authorized.
  It's gated behind the `server-only` package so it can't accidentally be
  imported into client code.

## Auth session handling

`proxy.ts` (Next 16's renamed `middleware.ts`) calls
`lib/supabase/middleware.ts#updateSession` on every request to refresh the
session cookie and redirect unauthenticated users away from protected
routes. `lib/supabase/server.ts` provides the per-request client for Server
Components/Actions/Route Handlers; `lib/supabase/client.ts` provides the
browser client for the few places that need one directly.

## Database type safety

`lib/supabase/database.types.ts` is hand-written to match what
`supabase gen types typescript` produces, including the `Relationships`
arrays the current `@supabase/postgrest-js` typing engine requires to type
embedded selects like `.select("*, breaks(*), job:jobs(...)")`. Once a
project is stable, regenerate it for real:

```
npx supabase gen types typescript --project-id <id> > lib/supabase/database.types.ts
```

## PWA / offline resilience

`app/manifest.ts` (Next's native App Router manifest convention) and
`public/sw.js` make WorkLedger installable and give it a real app shell:

- The service worker caches only immutable, fingerprinted assets
  (`/_next/static/*`, `/icons/*`) cache-first, and precaches `/offline`.
  Every page navigation still goes to the network first -- work records,
  earnings, and auth state must never be served from a stale cache --
  falling back to `/offline` only when the network is genuinely
  unreachable.
- `/manifest.webmanifest` and `/sw.js` are excluded from `proxy.ts`'s auth
  matcher (alongside static assets) so an unauthenticated fetch of either
  never gets redirected to `/login`; `/offline` is listed in
  `lib/supabase/middleware.ts#PUBLIC_PATHS` for the same reason, since the
  service worker fetches it once at install time while online.
- `components/pwa/register-sw.tsx` registers the worker from the root
  layout; `components/pwa/install-prompt.tsx` surfaces the browser's
  `beforeinstallprompt` event as a dismissible banner in the authenticated
  shell.
- `app/(app)/loading.tsx` (a shared skeleton) and `app/(app)/error.tsx` +
  `app/global-error.tsx` (recovery screens) cover the loading/error states
  the Definition of Done requires, for every route under `(app)` at once
  rather than per-page.

## Charts

`components/charts/` (`time-series-bar-chart.tsx`, `category-bar-chart.tsx`)
are hand-rolled in plain HTML/CSS -- no charting library. Both are server
components (no client state; hover/focus tooltips are pure CSS via
`group`/`group-hover`/`group-focus-within`), so they cost nothing to
hydrate. `lib/charts/scale.ts#niceAxisMax` picks a round axis ceiling and
tick step (the standard "nice numbers" algorithm); the chart derives its
gridline count from `max / step` rather than assuming a fixed tick count,
since `max` is only guaranteed to be a multiple of `step`, not of
`step * tickCount` -- getting this wrong once let a bar visually overshoot
the topmost gridline (see the regression test in
`tests/unit/charts/scale.test.ts`).

Colors come from `--chart-1` through `--chart-8` in `app/globals.css`, set
to the `dataviz` skill's validated default categorical palette (fixed hue
order, CVD-checked) rather than shadcn's arbitrary scaffold values, which
were unused anywhere in the codebase before this. Where the app already has
an established per-entity color (a job's own `color` field, shown as
swatches throughout the dashboard/payday UI), charts reuse *that* instead
of the categorical palette, for one consistent color-to-job mapping across
the whole app rather than two competing ones.

## Why the shadcn CLI wasn't used

The shadcn CLI's `init`/`add` commands fetch component source from
`ui.shadcn.com`, which was unreachable from this build's network sandbox.
`components/ui/*` was written by hand to the same "new-york" style/API
surface instead, so switching to the CLI later (e.g. `npx shadcn add
<component>`) should mostly just work for components not yet added.
