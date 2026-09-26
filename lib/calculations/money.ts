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

/** Formats cents as currency; `locale` is a BCP 47 tag (see INTL_LOCALES in lib/i18n/config). */
export function formatCents(cents: number, currency: string, locale: string): string {
  return formatMoney(centsToDollars(cents), currency, locale);
}

/** Formats a dollar (major-unit) amount, e.g. an `expenses.amount` numeric column. */
export function formatMoney(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}
