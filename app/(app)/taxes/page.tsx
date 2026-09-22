import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/data/context";
import { getAnnualIncomeEstimate, getPayPeriodStatements, getUpcomingPaydays } from "@/lib/data/tax";
import type { JurisdictionSelection } from "@/lib/calculations/tax";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaxSettingsForm } from "@/components/taxes/tax-settings-form";
import { PaydayCard } from "@/components/taxes/payday-card";
import { PayStatementCard } from "@/components/taxes/pay-statement-card";
import { TaxBreakdownCard } from "@/components/taxes/tax-breakdown-card";

export default async function TaxesPage() {
  const ctx = await requireUserContext();
  if (!ctx) return null;

  const supabase = await createClient();
  const [{ data: settings }, incomeEstimate, paydays, statements] = await Promise.all([
    supabase
      .from("user_settings")
      .select("tax_country, tax_region, tax_city")
      .eq("user_id", ctx.userId)
      .maybeSingle(),
    getAnnualIncomeEstimate(ctx.userId),
    getUpcomingPaydays(ctx.userId, ctx.timezone),
    getPayPeriodStatements(ctx.userId, ctx.timezone),
  ]);

  if (!settings) return null;

  const jurisdiction: JurisdictionSelection | null =
    settings.tax_country && settings.tax_region
      ? { country: settings.tax_country, region: settings.tax_region, city: settings.tax_city ?? undefined }
      : null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pay &amp; taxes</h1>
        <p className="text-sm text-muted-foreground">
          Track upcoming paydays and see an estimate of what&apos;s withheld from your pay.
        </p>
      </div>

      <PaydayCard paydays={paydays} />

      <PayStatementCard statements={statements} jurisdiction={jurisdiction} timezone={ctx.timezone} currency={ctx.currency} />

      <TaxSettingsForm settings={settings} />

      {jurisdiction ? (
        <TaxBreakdownCard
          jurisdiction={jurisdiction}
          estimatedAnnualIncomeCents={incomeEstimate.annualEstimateCents}
          hasIncomeData={incomeEstimate.hasData}
          currency={ctx.currency}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estimated tax withholding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set your tax jurisdiction above to see an estimate of your income tax and payroll deductions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
