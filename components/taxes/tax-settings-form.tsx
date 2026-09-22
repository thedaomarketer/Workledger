"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { updateTaxSettingsAction, type ActionResult } from "@/lib/actions/settings";
import { CANADA_PROVINCE_OPTIONS, US_CITY_OPTIONS, US_STATE_OPTIONS } from "@/lib/calculations/tax";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: ActionResult = {};

export function TaxSettingsForm({
  settings,
}: {
  settings: { tax_country: "CA" | "US" | null; tax_region: string | null; tax_city: string | null };
}) {
  const [state, formAction, pending] = useActionState(updateTaxSettingsAction, initialState);
  const [country, setCountry] = useState<"CA" | "US" | "">(settings.tax_country ?? "");
  const [region, setRegion] = useState(settings.tax_region ?? "");

  useEffect(() => {
    if (state.success) toast.success("Tax settings saved.");
  }, [state]);

  const regionOptions = country === "CA" ? CANADA_PROVINCE_OPTIONS : country === "US" ? US_STATE_OPTIONS : [];
  const regionLabel = country === "CA" ? "Province" : "State";
  const cityOptions = country === "US" ? US_CITY_OPTIONS.filter((c) => c.state === region) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tax jurisdiction</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="taxCountry">Country</Label>
              <Select
                name="taxCountry"
                defaultValue={settings.tax_country ?? undefined}
                onValueChange={(value) => {
                  setCountry(value as "CA" | "US");
                  setRegion("");
                }}
              >
                <SelectTrigger className="w-full" id="taxCountry">
                  <SelectValue placeholder="Not set" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="US">United States</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRegion">{regionLabel}</Label>
              <Select
                key={country}
                name="taxRegion"
                defaultValue={settings.tax_region ?? undefined}
                disabled={!country}
                onValueChange={setRegion}
              >
                <SelectTrigger className="w-full" id="taxRegion">
                  <SelectValue placeholder={country ? `Choose a ${regionLabel.toLowerCase()}` : "Choose a country first"} />
                </SelectTrigger>
                <SelectContent>
                  {regionOptions.map((opt) => (
                    <SelectItem key={opt.code} value={opt.code}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxCity">City (optional)</Label>
              <Select key={`${country}-${region}`} name="taxCity" defaultValue={settings.tax_city ?? undefined} disabled={cityOptions.length === 0}>
                <SelectTrigger className="w-full" id="taxCity">
                  <SelectValue placeholder={cityOptions.length ? "None" : "Not available"} />
                </SelectTrigger>
                <SelectContent>
                  {cityOptions.map((opt) => (
                    <SelectItem key={opt.code} value={opt.code}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save tax jurisdiction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
