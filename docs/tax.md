# Pay & Taxes

**Status: implemented.** `/taxes` shows upcoming paydays and an estimated tax withholding breakdown, scoped to the signed-in user.

## Principle

This is an estimate, not a payroll result. It exists to give workers a rough sense of what gets taken out of their pay and when their next payday is -- it is never presented as, and must never be confused with, an actual pay stub, a T4/W-2, or tax software's output.

## Payday awareness

- `jobs.pay_frequency` (`weekly` | `biweekly` | `semi_monthly` | `monthly`) and `jobs.pay_anchor_date` (a known past or upcoming pay date) are optional, per-job fields set from the job form (`components/jobs/job-form-fields.tsx`).
- `lib/calculations/payday.ts#getNextPayday` projects the next pay date forward from the anchor, operating on absolute instants (never naive date-string math) so it stays correct across DST transitions -- see `tests/unit/calculations/payday.test.ts`.
- `lib/data/tax.ts#getUpcomingPaydays` computes the next payday for every active job that has both fields set and returns them sorted soonest-first; `components/taxes/payday-card.tsx` renders the list. A job without a pay schedule configured simply doesn't appear.

## Tax withholding estimate

- `lib/calculations/tax/` is a pure, framework-free calculation engine (no Supabase, no `server-only` imports) mirroring the rest of `lib/calculations/`:
  - `bracket-math.ts` -- generic marginal-bracket tax and capped-flat-rate-deduction math, in integer cents.
  - `canada-federal.ts` / `canada-provinces.ts` / `canada-payroll.ts` -- federal + all 13 provincial/territorial brackets, plus CPP (incl. CPP2) and EI.
  - `us-federal.ts` / `us-states.ts` / `us-cities.ts` / `us-fica.ts` -- federal brackets (single filer, standard deduction) + all 50 states + DC, plus Social Security and Medicare (incl. the Additional Medicare surtax above $200k). `us-cities.ts` only models a small, deliberately incomplete set of local taxes (currently NYC and Philadelphia).
  - `estimate.ts#estimateTax(grossAnnualIncomeCents, jurisdiction)` is the single entry point, returning a full `TaxEstimateResult` (per-line income tax + payroll deductions, totals, net income, effective rate).
- Scope, by explicit product decision: **single-filer, standard-deduction estimate, current published brackets for the 2024 tax year** (`CANADA_TAX_YEAR` / `US_TAX_YEAR`). No filing-status setting, no credits, no other income. Every figure on `/taxes` is labeled an estimate.
- The bracket data was written from general knowledge, not pulled from a live feed. Verify it against each jurisdiction's published rates (or the CRA's combined rate tables / each state's department of revenue) before relying on it beyond a rough estimate, and re-check annually when brackets change. This limitation is intentional and disclosed in the UI copy, not a bug to silently work around.

## Where the "annual income" comes from

`lib/data/tax.ts#getAnnualIncomeEstimate` averages actual recorded earnings (via the existing `summarizeShiftsByJob`/`sumJobSummaries` calculation layer -- the same one Dashboard and Reports use) over the last 8 completed weeks and annualizes it (`x 52`). This is only ever a starting point: `components/taxes/tax-breakdown-card.tsx` pre-fills an editable "estimated annual income" input with that number and recomputes the breakdown client-side on every change, so the user's own expectation always wins over the historical average. When there isn't 8 weeks of history yet, the field starts empty/zero and says so.

## Data model

- `user_settings.tax_country` (`'CA' | 'US'`, nullable), `tax_region` (province/state code), `tax_city` (optional local jurisdiction code) -- set via `components/taxes/tax-settings-form.tsx` / `updateTaxSettingsAction`. Same RLS as the rest of `user_settings` (`(select auth.uid()) = user_id`).
- `jobs.pay_frequency`, `jobs.pay_anchor_date` -- set via the job form / `createJobAction` / `updateJobAction`. Same RLS as the rest of `jobs`.
- Migration: `supabase/migrations/00000000000017_tax_and_pay_schedule.sql`.

## Not built

- Billing/subscriptions (Stripe) -- separate, not yet started.
- A live/updating tax-bracket data feed -- brackets are a point-in-time snapshot in code, updated manually.
