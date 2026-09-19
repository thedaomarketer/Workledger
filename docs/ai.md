# AI Assistant

**Status: not implemented.** `/assistant` is a placeholder page
(`app/(app)/assistant/page.tsx`). This document records the intended
design so it can be built consistently with the rest of the app when it's
prioritized (see `docs/roadmap.md`, Phase 6).

## Principle

AI is an interface over trusted data, not a source of truth. Database
records are the source of truth. The AI must never fabricate hours,
earnings, shifts, expenses, incidents, or dates — when data is missing, it
must say so rather than guess.

## Planned architecture

```
User
 -> AI Chat UI (new /assistant page, replacing the current placeholder)
 -> Server-side AI route (app/api/assistant/route.ts, not yet built)
 -> Tool authorization (verify the request's user, scope every tool call
    to that user's own data — never pass a user_id from the client)
 -> Controlled tools querying lib/data/* helpers (never raw SQL, never a
    prompt-constructed query)
 -> Structured result
 -> AI response, citing the underlying records where practical
```

The model must never be given direct database or arbitrary-SQL access.
Every fact it can report should come from a named tool call whose output
is fully attributable back to a table this app already owns.

## Planned tools

Each tool should be a thin wrapper around the existing `lib/calculations`
+ `lib/data` layer, so the numbers the assistant reports are guaranteed to
match what the Dashboard/Reports pages show for the same range:

- `get_hours(range, jobId?)` — regular/overtime/total paid minutes
- `get_shifts(range, jobId?)` — shift list with computed durations
- `get_earnings(range, jobId?)` — earnings breakdown (via
  `lib/calculations/overtime.ts#calculateEarnings`)
- `get_overtime(range, jobId?)`
- `get_expenses(range, jobId?, category?)`
- `get_mileage(range, jobId?)`
- `get_schedule(range)`
- `get_journal_entries(range, jobId?, entryType?)`
- `generate_report(range, jobId?)` — the same aggregation `/reports`
  already does

## Storage

`ai_conversations` and `ai_messages` tables already exist (migration
`00000000000013`) with RLS scoped to the owning user, ready for this
feature — they just aren't written to yet.

## Required response behavior

- Distinguish **recorded** values (from actual shifts/expenses) from
  **estimated** ones (e.g. projecting a partial pay period).
- Never present an estimate as an actual payroll deposit. Example phrasing
  from the original product spec:

  > Based on your recorded shifts, your estimated gross earnings were
  > $3,842.50. This includes 154 regular hours and 6.5 overtime hours.
  > This is a gross estimate based on your WorkLedger records. It does not
  > represent your actual payroll deposit.

- Ask for clarification when a query is ambiguous (e.g. "last month"
  without a clear timezone-aware boundary) rather than guessing.
- Cite the underlying records inside the app when practical (e.g. "see
  your Reports page for the week of...").
