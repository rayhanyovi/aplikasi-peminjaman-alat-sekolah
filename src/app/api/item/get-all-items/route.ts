import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET(req: Request) {
  try {
    const { data: items, error } = await supabaseAdmin
      .from("items")
      .select("*");
    if (error) throw error;

    const borrowerIds = [
      ...new Set(items.map((item) => item.borrowed_by).filter(Boolean)),
    ];

    const { data: borrowers, error: borrowersError } = await supabaseAdmin
      .from("profiles")
      .select("id, name, email")
      .in("id", borrowerIds);

    if (borrowersError) throw borrowersError;

    const borrowerMap = new Map(
      (borrowers || []).map((borrower) => [borrower.id, borrower])
    );

    const enrichedItems = items.map((item) => ({
      ...item,
      borrowed_by: borrowerMap.get(item.borrowed_by) || null,
    }));

    return NextResponse.json(
      enrichedItems,

      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing loan request:", error);
    return NextResponse.json(
      { message: "An error occurred while processing the loan request" },
      { status: 500 }
    );
  }
}
