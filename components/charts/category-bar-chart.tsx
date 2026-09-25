export interface CategoryDatum {
  label: string;
  value: number;
  /** A CSS color value (e.g. a job's own hex color, or "var(--color-chart-3)"). */
  color: string;
}

/**
 * A horizontal bar chart for comparing magnitude across a handful of named
 * categories (jobs, expense categories). Each row's label already gives it
 * a name, so no separate legend is needed -- identity never rests on color
 * alone. Bars are sorted largest-first and the value is always shown, never
 * gated behind hover.
 */
export function CategoryBarChart({
  data,
  formatValue,
  emptyMessage,
}: {
  data: CategoryDatum[];
  formatValue: (value: number) => string;
  emptyMessage: string;
}) {
  const sorted = [...data].filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
  const max = Math.max(0, ...sorted.map((d) => d.value));

  if (sorted.length === 0) {
    return <p className="flex h-32 items-center justify-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {sorted.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-sm text-muted-foreground sm:w-32" title={d.label}>
            {d.label}
          </span>
          <div className="flex min-w-0 flex-1 items-center">
            <div
              className="h-5 rounded-r-[4px]"
              style={{ width: `${Math.max((d.value / max) * 100, 2)}%`, backgroundColor: d.color }}
              role="img"
              aria-label={`${d.label}: ${formatValue(d.value)}`}
            />
            <span className="ml-2 shrink-0 text-sm font-medium tabular-nums">{formatValue(d.value)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
