import Papa from "papaparse";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

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
    .from("expenses")
    .select("*, job:jobs(name)")
    .eq("user_id", user.id)
    .order("expense_date", { ascending: true });

  if (start) query = query.gte("expense_date", start);
  if (end) query = query.lte("expense_date", end);

  const { data: expenses } = await query;

  const rows = (expenses ?? []).map((expense) => ({
    Date: expense.expense_date,
    Job: expense.job?.name ?? "",
    Category: expense.category,
    Amount: expense.amount,
    Currency: expense.currency,
    Description: expense.description ?? "",
  }));

  const csv = Papa.unparse(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="workledger-expenses.csv"`,
    },
  });
}
