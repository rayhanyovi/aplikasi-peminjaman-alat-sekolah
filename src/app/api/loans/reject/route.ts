// app/api/loans/reject/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import type { ApiResponse, LoanRejection } from "@/types/api";
import { getUserFromToken } from "@/lib/helper/getUserFromToken";

export async function PUT(req: Request) {
  try {
    const user = await getUserFromToken(req);

    if (user.role !== "admin" && user.role !== "superadmin") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "You are not authorized to reject loans",
        },
        { status: 403 }
      );
    }

    const { itemId, rejectionNote }: LoanRejection = await req.json();

    if (!itemId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Item ID is required",
        },
        { status: 400 }
      );
    }

    if (!rejectionNote) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Rejection note is required",
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
      .select("id")
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

    const { error: updateLoanError } = await supabaseAdmin
      .from("loans")
      .update({
        status: "rejected",
        rejected_by: user.id,
        rejected_at: new Date().toISOString(),
        rejection_notice: rejectionNote,
      })
      .eq("id", loan.id);

    if (updateLoanError) {
      throw new Error(updateLoanError.message);
    }

    // Update item status back to available
    const { error: updateItemError } = await supabaseAdmin
      .from("items")
      .update({
        status: "tersedia",
        borrowed_by: null,
      })
      .eq("id", itemId);

    if (updateItemError) {
      throw new Error(updateItemError.message);
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Loan rejected successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to reject loan",
      },
      { status: error.message.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
