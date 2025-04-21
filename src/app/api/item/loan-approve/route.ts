import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserRoleFromToken } from "@/lib/helper/authHelper";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function PUT(req: Request) {
  try {
    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json(
        { message: "Item ID is required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
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

    const role = await getUserRoleFromToken(token);

    if (role !== "admin" && role !== "superadmin") {
      return NextResponse.json(
        { message: "Unauthorized: Only admin and superadmin can approve" },
        { status: 403 }
      );
    }

    if (userError || !user) {
      return NextResponse.json(
        { message: "User not found or invalid token" },
        { status: 404 }
      );
    }

    const { data: item, error: itemError } = await supabaseAdmin
      .from("items")
      .select("id, status")
      .eq("id", itemId)
      .single();

    if (itemError) {
      return NextResponse.json(
        { message: itemError.message, dor: "xxx" },
        { status: 500 }
      );
    }

    const { data: loan, error: loanError } = await supabaseAdmin
      .from("loans")
      .select("id, student_id")
      .eq("item_id", itemId)
      .eq("status", "pending")
      .single();

    if (loanError) {
      return NextResponse.json(
        { message: loanError.message, dor: "yyy" },
        { status: 500 }
      );
    }

    const { error } = await supabaseAdmin
      .from("loans")
      .update({
        status: "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", loan?.id);

    if (error) {
      return NextResponse.json(
        { message: error.message, dor: "zzz" },
        { status: 500 }
      );
    }

    await supabaseAdmin
      .from("items")
      .update({
        status: "dipinjam",
        borrowed_by: loan.student_id,
      })
      .eq("id", itemId);

    const { data: borrower } = await supabaseAdmin
      .from("profiles")
      .select("name, email")
      .eq("id", loan.student_id)
      .single();

    return NextResponse.json(
      {
        message: "Loan approved successfully",
        success: true,
        borrower: borrower,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing loan request:", error);
    return NextResponse.json(
      { message: "An error occurred while processing the loan request" },
      { status: 500 }
    );
  }
}
