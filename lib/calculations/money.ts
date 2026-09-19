/**
 * Money helpers. All arithmetic is performed on integer cents to avoid
 * floating point drift; the only place a fractional number is tolerated is
 * converting a user-entered dollar amount into cents, which is rounded
 * immediately to the nearest cent.
 */

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function centsToDollars(cents: number): number {
  return cents / 100;
}

/** Earnings, in cents, for a number of minutes at a given hourly rate (cents/hour). */
export function earningsCentsForMinutes(
  minutes: number,
  hourlyRateCents: number
): number {
  if (minutes <= 0 || hourlyRateCents <= 0) return 0;
  return Math.round((minutes * hourlyRateCents) / 60);
}

export function formatCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(centsToDollars(cents));
}
