import { niceAxisMax } from "@/lib/charts/scale";

export interface TimeSeriesSeries {
  key: string;
  label: string;
  /** A literal Tailwind class, e.g. "bg-chart-1" -- must exist as a static string somewhere for Tailwind to generate it. */
  colorClassName: string;
}

export interface TimeSeriesPoint {
  /** x-axis tick label, e.g. "Jun 10". */
  label: string;
  /** seriesKey -> value, in the same unit for every series. */
  values: Record<string, number>;
}

const TICK_COUNT = 4;
const PLOT_HEIGHT = 176; // px; the fixed pixel height gridlines and bars both resolve percentages against.

/**
 * A vertical bar chart over time buckets -- one bar per series, or a
 * stacked bar when multiple series are given. Every value is a direct,
 * always-visible label; hover/focus adds a per-series breakdown, but never
 * gates a number behind it (see the dataviz skill's interaction rules).
 */
export function TimeSeriesBarChart({
  data,
  series,
  formatValue,
  formatAxisTick = formatValue,
  emptyMessage,
}: {
  data: TimeSeriesPoint[];
  series: TimeSeriesSeries[];
  formatValue: (value: number) => string;
  formatAxisTick?: (value: number) => string;
  emptyMessage: string;
}) {
  const totals = data.map((point) => series.reduce((sum, s) => sum + (point.values[s.key] ?? 0), 0));
  const rawMax = Math.max(0, ...totals);

  if (rawMax === 0) {
    return (
      <p className="flex items-center justify-center text-sm text-muted-foreground" style={{ height: PLOT_HEIGHT }}>
        {emptyMessage}
      </p>
    );
  }

  const { max, step } = niceAxisMax(rawMax, TICK_COUNT);
  // Derive ticks from max/step directly (never a fixed TICK_COUNT+1 count):
  // `max` is only guaranteed to be a multiple of `step`, not of `step *
  // TICK_COUNT`, so hard-coding the tick count could stop short of `max`
  // and let a bar visually overshoot the topmost gridline.
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => step * i);

  return (
    <div>
      {series.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span className={`size-2.5 rounded-full ${s.colorClassName}`} />
              {s.label}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <div
          className="flex w-12 shrink-0 flex-col justify-between text-right text-xs text-muted-foreground tabular-nums"
          style={{ height: PLOT_HEIGHT }}
        >
          {[...ticks].reverse().map((tick) => (
            <span key={tick} className="whitespace-nowrap">
              {formatAxisTick(tick)}
            </span>
          ))}
        </div>

        <div className="relative flex flex-1 items-stretch gap-2 border-l border-chart-axis" style={{ height: PLOT_HEIGHT }}>
          {ticks.map((tick) => (
            <div
              key={tick}
              className="pointer-events-none absolute left-0 w-full border-t border-chart-grid"
              style={{ bottom: `${(tick / max) * 100}%` }}
            />
          ))}

          {data.map((point, i) => {
            const total = totals[i];
            return (
              <div key={point.label} className="group relative flex flex-1 flex-col items-center">
                <span className="mb-1 shrink-0 text-xs font-medium tabular-nums">
                  {total > 0 ? formatValue(total) : ""}
                </span>
                <div
                  tabIndex={total > 0 ? 0 : undefined}
                  role={total > 0 ? "img" : undefined}
                  aria-label={
                    total > 0
                      ? `${point.label}: ${series.map((s) => `${s.label} ${formatValue(point.values[s.key] ?? 0)}`).join(", ")}`
                      : undefined
                  }
                  className="flex w-full max-w-6 flex-1 flex-col-reverse gap-0.5 rounded-t-[4px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {series.map((s) => {
                    const value = point.values[s.key] ?? 0;
                    if (value <= 0) return null;
                    return (
                      <div
                        key={s.key}
                        className={`w-full first:rounded-t-[4px] ${s.colorClassName}`}
                        style={{ height: `${(value / max) * 100}%` }}
                      />
                    );
                  })}
                </div>

                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden w-max -translate-x-1/2 whitespace-nowrap rounded-md border bg-popover px-2 py-1.5 text-xs shadow-md group-hover:block group-focus-within:block">
                  <p className="font-medium text-popover-foreground">{point.label}</p>
                  {series.map((s) => (
                    <p key={s.key} className="flex items-center gap-1.5 text-muted-foreground">
                      <span className={`size-1.5 rounded-full ${s.colorClassName}`} />
                      {s.label}: <span className="font-medium text-popover-foreground">{formatValue(point.values[s.key] ?? 0)}</span>
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-1.5">
        <div className="w-12 shrink-0" aria-hidden="true" />
        <div className="flex flex-1 gap-2">
          {data.map((point) => (
            <span key={point.label} className="flex-1 text-center text-xs leading-tight text-muted-foreground">
              {point.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
