import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/data/context";
import { CreateMileageDialog } from "@/components/mileage/create-mileage-dialog";
import { MileageList } from "@/components/mileage/mileage-list";
import { Card, CardContent } from "@/components/ui/card";

export default async function MileagePage() {
  const ctx = await requireUserContext();
  if (!ctx) return null;

  const supabase = await createClient();
  const [{ data: entries }, { data: jobs }] = await Promise.all([
    supabase
      .from("mileage_entries")
      .select("*, job:jobs(name, color)")
      .eq("user_id", ctx.userId)
      .order("date", { ascending: false })
      .limit(200),
    supabase.from("jobs").select("id, name").eq("user_id", ctx.userId).eq("is_active", true),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] leading-tight font-bold tracking-tight md:text-3xl">Mileage</h1>
        <CreateMileageDialog jobs={jobs ?? []} />
      </div>
      <Card>
        <CardContent className="px-0 pt-6 sm:px-6">
          <MileageList entries={entries ?? []} currency={ctx.currency} />
        </CardContent>
      </Card>
    </div>
  );
}
