import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserRoleFromToken } from "@/lib/helper/authHelper";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function PUT(req: Request) {
  try {
    const { itemId, rejectionNote } = await req.json();

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
      return NextResponse.json({ message: itemError.message }, { status: 500 });
    }

    const { data: loan, error: loanError } = await supabaseAdmin
      .from("loans")
      .select("id")
      .eq("item_id", itemId)
      .eq("status", "pending")
      .single();

    if (loanError) {
      return NextResponse.json({ message: loanError.message }, { status: 500 });
    }

    const { error } = await supabaseAdmin
      .from("loans")
      .update({
        status: "rejected",
        rejected_by: user.id,
        rejected_at: new Date().toISOString(),
        rejection_notice: rejectionNote,
      })
      .eq("id", loan?.id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Loan approved successfully",
        success: true,
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
