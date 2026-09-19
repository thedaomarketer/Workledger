import Papa from "papaparse";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { calculateShiftDuration } from "@/lib/calculations";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  let query = supabase
    .from("shifts")
    .select("*, breaks(*), job:jobs(name)")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("actual_start", { ascending: true });

  if (start) query = query.gte("actual_start", `${start}T00:00:00.000Z`);
  if (end) query = query.lte("actual_start", `${end}T23:59:59.999Z`);

  const { data: shifts } = await query;

  const rows = (shifts ?? []).map((shift) => {
    const result = calculateShiftDuration({
      start: shift.actual_start!,
      end: shift.actual_end,
      breaks: shift.breaks.map((b) => ({ startedAt: b.started_at, endedAt: b.ended_at, isPaid: b.is_paid })),
    });
    return {
      Date: shift.actual_start?.slice(0, 10) ?? "",
      Job: shift.job?.name ?? "",
      Start: shift.actual_start ?? "",
      End: shift.actual_end ?? "",
      "Gross minutes": result.grossMinutes,
      "Unpaid break minutes": result.unpaidBreakMinutes,
      "Paid minutes": result.paidMinutes,
      Notes: shift.notes ?? "",
    };
  });

  const csv = Papa.unparse(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="workledger-hours.csv"`,
    },
  });
}
