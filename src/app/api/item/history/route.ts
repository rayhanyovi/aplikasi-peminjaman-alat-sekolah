// /app/api/item/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const itemId = searchParams.get("itemId") || "";

  if (!itemId) {
    return NextResponse.json({ error: "Invalid itemId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("loans")
    .select("id, return_note, returned_at, student_id, approved_at")
    .eq("item_id", itemId)
    .in("status", ["returned", "approved"])
    .order("returned_at", { ascending: false });

  if (error) return NextResponse.json({ error }, { status: 500 });

  const studentIds = data.map((entry) => entry.student_id);
  const { data: students, error: studentsError } = await supabase
    .from("profiles")
    .select("id, name")
    .in(
      "id",
      data.map((entry) => entry.student_id)
    );

  if (studentsError)
    return NextResponse.json({ error: studentsError }, { status: 500 });

  const studentsMap = new Map(students.map((s) => [s.id, s.name]));
  const historyWithBorrower = data.map((entry) => ({
    ...entry,
    borrower: studentsMap.get(entry.student_id) || null,
  }));

  return NextResponse.json(historyWithBorrower);
}
