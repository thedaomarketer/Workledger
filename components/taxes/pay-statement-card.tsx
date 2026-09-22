import { FileText } from "lucide-react";

import type { PayPeriodStatement } from "@/lib/data/tax";
import type { JurisdictionSelection } from "@/lib/calculations/tax";
import { estimateTaxForPeriod } from "@/lib/calculations/tax";
import { formatCents } from "@/lib/calculations/money";
import { formatMinutesAsHours } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function formatPeriodDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: timezone }).format(date);
}

export function PayStatementCard({
  statements,
  jurisdiction,
  timezone,
  currency,
}: {
  statements: PayPeriodStatement[];
  jurisdiction: JurisdictionSelection | null;
  timezone: string;
  currency: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="size-4" /> Current pay period
        </CardTitle>
      </CardHeader>
      <CardContent>
        {statements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add a pay frequency and a known pay date to a job to see a pay-period statement here.
          </p>
        ) : (
          <div className="space-y-6">
            {statements.map((statement, i) => {
              const isEmpty = statement.periodStart.getTime() === statement.periodEnd.getTime();
              const estimate = jurisdiction
                ? estimateTaxForPeriod(statement.grossEarningsCents, statement.periodsPerYear, jurisdiction)
                : null;

              return (
                <div key={statement.jobId}>
                  {i > 0 && <Separator className="mb-6" />}
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: statement.color }} />
                      <span className="truncate text-sm font-medium">{statement.jobName}</span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {isEmpty
                        ? `Starts ${formatPeriodDate(statement.periodStart, timezone)}`
                        : `${formatPeriodDate(statement.periodStart, timezone)} – ${formatPeriodDate(statement.periodEnd, timezone)}`}
                    </span>
                  </div>

                  {isEmpty ? (
                    <p className="text-sm text-muted-foreground">This job&apos;s first pay period hasn&apos;t started yet.</p>
                  ) : (
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hours worked</span>
                        <span>{formatMinutesAsHours(statement.paidMinutes)}</span>
                      </div>
                      {statement.overtimeMinutes > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Overtime</span>
                          <span>{formatMinutesAsHours(statement.overtimeMinutes)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium">
                        <span>Gross pay</span>
                        <span>{formatCents(statement.grossEarningsCents, currency)}</span>
                      </div>
                      {estimate ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Est. deductions</span>
                            <span>-{formatCents(estimate.periodDeductionsCents, currency)}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Est. net pay</span>
                            <span>{formatCents(estimate.periodNetCents, currency)}</span>
                          </div>
                        </>
                      ) : (
                        <p className="pt-1 text-xs text-muted-foreground">
                          Set your tax jurisdiction below to see estimated deductions and net pay.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
