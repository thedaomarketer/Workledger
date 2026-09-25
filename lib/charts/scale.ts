/**
 * "Nice numbers" axis scaling (Heckbert's algorithm): picks a round tick
 * step and ceiling so gridlines land on clean values (0 / 25 / 50, not
 * 0 / 23.7 / 47.4) instead of dividing the raw max evenly.
 */
function niceNumber(range: number, round: boolean): number {
  if (range <= 0) return 1;
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / 10 ** exponent;
  let niceFraction: number;

  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }

  return niceFraction * 10 ** exponent;
}

/** A round axis ceiling >= `maxValue` and the step between gridlines. */
export function niceAxisMax(maxValue: number, tickCount = 4): { max: number; step: number } {
  if (maxValue <= 0) return { max: tickCount, step: 1 };
  const step = niceNumber(maxValue / tickCount, true);
  const max = Math.ceil(maxValue / step) * step;
  return { max, step };
}
