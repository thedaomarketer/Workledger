"use client";

import { useMemo, useState } from "react";
import { Receipt } from "lucide-react";

import { estimateTax, type JurisdictionSelection } from "@/lib/calculations/tax";
import { centsToDollars, dollarsToCents, formatCents } from "@/lib/calculations/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function TaxBreakdownCard({
  jurisdiction,
  estimatedAnnualIncomeCents,
  hasIncomeData,
  currency,
}: {
  jurisdiction: JurisdictionSelection;
  estimatedAnnualIncomeCents: number;
  hasIncomeData: boolean;
  currency: string;
}) {
  const [annualIncomeDollars, setAnnualIncomeDollars] = useState(() =>
    centsToDollars(estimatedAnnualIncomeCents).toFixed(0)
  );

  const result = useMemo(() => {
    const cents = Math.max(0, dollarsToCents(Number(annualIncomeDollars) || 0));
    return estimateTax(cents, jurisdiction);
  }, [annualIncomeDollars, jurisdiction]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="size-4" /> Estimated tax withholding
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="annualIncome">Estimated annual gross income</Label>
          <Input
            id="annualIncome"
            type="number"
            min={0}
            step="1"
            value={annualIncomeDollars}
            onChange={(e) => setAnnualIncomeDollars(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {hasIncomeData
              ? "Pre-filled from your recorded shifts over the last 8 weeks, annualized. Adjust it to match what you actually expect to earn this year."
              : "We don't have enough recorded shift history yet to estimate this automatically. Enter what you expect to earn this year."}
          </p>
        </div>

        <Separator />

        <div className="space-y-1.5 text-sm">
          {result.incomeTaxLines.map((line) => (
            <div key={line.label} className="flex justify-between">
              <span className="text-muted-foreground">{line.label}</span>
              <span>{formatCents(line.amountCents, currency)}</span>
            </div>
          ))}
          {result.payrollDeductionLines.map((line) => (
            <div key={line.label} className="flex justify-between">
              <span className="text-muted-foreground">{line.label}</span>
              <span>{formatCents(line.amountCents, currency)}</span>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-1.5">
          <div className="flex justify-between text-sm font-medium">
            <span>Total estimated deductions</span>
            <span>{formatCents(result.totalDeductionsCents, currency)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Estimated net income</span>
            <span>{formatCents(result.netAnnualIncomeCents, currency)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Effective rate</span>
            <span>{(result.effectiveRate * 100).toFixed(1)}%</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          This is a simplified {result.taxYear} estimate for a single filer taking the standard deduction. It
          does not account for other income, credits, or deductions, and is not a substitute for a pay stub or
          tax software.
        </p>
      </CardContent>
    </Card>
  );
}
