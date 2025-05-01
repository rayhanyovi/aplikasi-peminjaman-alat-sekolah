// app/api/loans/approve/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

import type { ApiResponse, LoanApproval } from "@/types/api";
import { getUserFromToken } from "@/lib/helper/getUserFromToken";

export async function PUT(req: Request) {
  try {
    const user = await getUserFromToken(req);

    if (user.role !== "admin" && user.role !== "superadmin") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "You are not authorized to approve loans",
        },
        { status: 403 }
      );
    }

    const { itemId }: LoanApproval = await req.json();

    if (!itemId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Item ID is required",
        },
        { status: 400 }
      );
    }

    // Check if item exists and has a pending loan
    const { data: item, error: itemError } = await supabaseAdmin
      .from("items")
      .select("id, status")
      .eq("id", itemId)
      .single();

    if (itemError || !item) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Item not found",
        },
        { status: 404 }
      );
    }

    if (item.status !== "pending") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Item does not have a pending loan request",
        },
        { status: 400 }
      );
    }

    // Get the pending loan
    const { data: loan, error: loanError } = await supabaseAdmin
      .from("loans")
      .select("id, student_id")
      .eq("item_id", itemId)
      .eq("status", "pending")
      .single();

    if (loanError || !loan) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "No pending loan found for this item",
        },
        { status: 404 }
      );
    }

    // Update loan status
    const { error: updateLoanError } = await supabaseAdmin
      .from("loans")
      .update({
        status: "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", loan.id);

    if (updateLoanError) {
      throw new Error(updateLoanError.message);
    }

    // Update item status
    const { error: updateItemError } = await supabaseAdmin
      .from("items")
      .update({
        status: "dipinjam",
        borrowed_by: loan.student_id,
      })
      .eq("id", itemId);

    if (updateItemError) {
      throw new Error(updateItemError.message);
    }

    // Get borrower info
    const { data: borrower } = await supabaseAdmin
      .from("profiles")
      .select("name, email")
      .eq("id", loan.student_id)
      .single();

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { borrower },
        message: "Loan approved successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to approve loan",
      },
      { status: error.message.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
