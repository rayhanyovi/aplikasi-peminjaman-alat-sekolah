// app/api/loans/return/route.ts
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import type { ApiResponse, ItemReturn } from "@/types/api"

export async function POST(req: Request) {
  try {
    // Ensure user is admin or superadmin
    await requireRole(req, ["admin", "superadmin"])

    const { itemId, returnNote }: ItemReturn = await req.json()

    if (!itemId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Item ID is required",
        },
        { status: 400 },
      )
    }

    if (!returnNote) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Return note is required",
        },
        { status: 400 },
      )
    }

    // Check if item exists and is borrowed
    const { data: item, error: itemError } = await supabaseAdmin
      .from("items")
      .select("id, status, borrowed_by")
      .eq("id", itemId)
      .single()

    if (itemError || !item) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Item not found",
        },
        { status: 404 },
      )
    }

    if (item.status !== "dipinjam") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Item is not currently borrowed",
        },
        { status: 400 },
      )
    }

    // Get the active loan
    const { data: loan, error: loanError } = await supabaseAdmin
      .from("loans")
      .select("id")
      .eq("item_id", itemId)
      .eq("status", "approved")
      .single()

    if (loanError || !loan) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "No active loan found for this item",
        },
        { status: 404 },
      )
    }

    // Update loan status
    const { error: updateLoanError } = await supabaseAdmin
      .from("loans")
      .update({
        status: "returned",
        returned_at: new Date().toISOString(),
        return_note: returnNote,
      })
      .eq("id", loan.id)

    if (updateLoanError) {
      throw new Error(updateLoanError.message)
    }

    // Update item status
    const { error: updateItemError } = await supabaseAdmin
      .from("items")
      .update({
        status: "tersedia",
        borrowed_by: null,
      })
      .eq("id", itemId)

    if (updateItemError) {
      throw new Error(updateItemError.message)
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Item returned successfully",
      },
      { status: 200 },
    )
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to process return",
      },
      { status: error.message.includes("Unauthorized") ? 403 : 500 },
    )
  }
}
