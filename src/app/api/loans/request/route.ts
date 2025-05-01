// app/api/loans/request/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import type { ApiResponse, LoanRequest } from "@/types/api";
import { getUserFromToken } from "@/lib/helper/getUserFromToken";

export async function POST(req: Request) {
  try {
    // Get authenticated user (must be a student)
    const user = await getUserFromToken(req);

    const body = await req.json();

    const { itemId, requestNote, expectedReturn } = body;

    if (!itemId || !requestNote || !expectedReturn) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Item ID, Request Note, and Expected Return Date is required",
        },
        { status: 400 }
      );
    }

    // Check if item exists and is available
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

    if (item.status !== "tersedia") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Item is not available for loan",
        },
        { status: 400 }
      );
    }

    // Create loan request
    const { data: loan, error: loanError } = await supabaseAdmin
      .from("loans")
      .insert({
        item_id: itemId,
        student_id: user.id,
        status: "pending",
        expected_return_at: expectedReturn,
        request_note: requestNote,
        requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (loanError) {
      throw new Error(loanError.message);
    }

    // Update item status to pending
    await supabaseAdmin
      .from("items")
      .update({ status: "pending" })
      .eq("id", itemId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: loan,
        message: "Loan request submitted successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to request loan",
      },
      { status: error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
