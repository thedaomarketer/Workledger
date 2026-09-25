import { Download } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/data/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";

export default async function SettingsPage() {
  const ctx = await requireUserContext();
  if (!ctx) return null;

  const supabase = await createClient();
  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", ctx.userId).maybeSingle(),
    supabase.from("user_settings").select("*").eq("user_id", ctx.userId).maybeSingle(),
  ]);

  if (!profile || !settings) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-[28px] leading-tight font-bold tracking-tight md:text-3xl">Settings</h1>

      <ProfileForm profile={profile} />
      <PreferencesForm settings={settings} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Download a copy of everything WorkLedger has recorded for you.
          </p>
          <Button asChild variant="outline">
            <a href="/api/account/export">
              <Download /> Export my data
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </div>
  );
}
