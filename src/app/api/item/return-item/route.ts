import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserRoleFromToken } from "@/lib/helper/authHelper";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function PUT(req: Request) {
  try {
    const { itemId, returnNote } = await req.json();

    if (!itemId) {
      console.warn("[Error] Missing loanId");
      return NextResponse.json(
        { message: "Loan ID is required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("[Error] Missing or malformed Authorization header");
      return NextResponse.json(
        { message: "Unauthorized: Token required" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError) {
      console.error("[Supabase Auth Error]", userError);
    }

    const role = await getUserRoleFromToken(token);

    if (!["admin", "superadmin"].includes(role)) {
      console.warn("[Error] Unauthorized role:", role);
      return NextResponse.json(
        { message: "Unauthorized: Only admin or superadmin can return" },
        { status: 403 }
      );
    }

    if (!user) {
      console.warn("[Error] User not found from token");
      return NextResponse.json(
        { message: "User not found or invalid token" },
        { status: 404 }
      );
    }

    const { data: loan, error: loanError } = await supabaseAdmin
      .from("loans")
      .select("id, status")
      .eq("item_id", itemId)
      .eq("status", "approved")
      .single();

    if (loanError) {
      return NextResponse.json(
        { message: loanError.message, dor: "xxx" },
        { status: 500 }
      );
    }

    if (!loan) {
      return NextResponse.json({ message: "Loan not found" }, { status: 404 });
    }

    if (loan.status === "returned") {
      return NextResponse.json(
        { message: "Item already returned" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("loans")
      .update({
        status: "returned",
        returned_at: new Date().toISOString(),
        return_note: returnNote,
      })
      .eq("id", loan.id);

    if (error) {
      console.error("[Update Loan Error]", error.message);
      return NextResponse.json(
        { message: error.message, dor: "yyy" },
        { status: 500 }
      );
    }

    await supabaseAdmin
      .from("items")
      .update({
        status: "tersedia",
        borrowed_by: null,
      })
      .eq("id", itemId);

    return NextResponse.json(
      { message: "Item returned successfully", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Catch Block Error]", error);
    return NextResponse.json(
      { message: "An error occurred while returning the item" },
      { status: 500 }
    );
  }
}
