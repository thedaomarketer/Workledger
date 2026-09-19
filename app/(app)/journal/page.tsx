import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/data/context";
import { CreateEntryDialog } from "@/components/journal/create-entry-dialog";
import { JournalTimeline } from "@/components/journal/journal-timeline";

export default async function JournalPage() {
  const ctx = await requireUserContext();
  if (!ctx) return null;

  const supabase = await createClient();
  const [{ data: entries }, { data: jobs }] = await Promise.all([
    supabase
      .from("journal_entries")
      .select("*, job:jobs(name, color)")
      .eq("user_id", ctx.userId)
      .order("event_at", { ascending: false })
      .limit(100),
    supabase.from("jobs").select("id, name").eq("user_id", ctx.userId).eq("is_active", true),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Journal</h1>
          <p className="text-sm text-muted-foreground">Your Work Evidence Timeline.</p>
        </div>
        <CreateEntryDialog jobs={jobs ?? []} />
      </div>
      <JournalTimeline entries={entries ?? []} timezone={ctx.timezone} />
    </div>
  );
}
