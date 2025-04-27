// app/api/items/[id]/history/route.ts
import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import type { ApiResponse, HistoryEntry } from "@/types/api"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // Any authenticated user can get history
    const user = await getUserFromRequest(req)
    const itemId = params.id

    // Check if item exists
    const { data: item, error: itemError } = await supabaseAdmin.from("items").select("id").eq("id", itemId).single()

    if (itemError || !item) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Item not found",
        },
        { status: 404 },
      )
    }

    // Get loan history
    const { data: loans, error: loansError } = await supabaseAdmin
      .from("loans")
      .select("id, item_id, student_id, approved_at, returned_at, return_note")
      .eq("item_id", itemId)
      .in("status", ["returned", "approved"])
      .order("approved_at", { ascending: false })

    if (loansError) {
      throw new Error(loansError.message)
    }

    // If no loans, return empty array
    if (!loans || loans.length === 0) {
      return NextResponse.json<ApiResponse<HistoryEntry[]>>(
        {
          success: true,
          data: [],
          message: "No history found for this item",
        },
        { status: 200 },
      )
    }

    // Get student names for the loans
    const studentIds = [...new Set(loans.map((loan) => loan.student_id))]
    const { data: students, error: studentsError } = await supabaseAdmin
      .from("profiles")
      .select("id, name")
      .in("id", studentIds)

    if (studentsError) {
      throw new Error(studentsError.message)
    }

    // Create a map of student IDs to names
    const studentMap = new Map(students.map((student) => [student.id, student.name]))

    // Map loans to history entries
    const history: HistoryEntry[] = loans.map((loan) => ({
      id: loan.id,
      item_id: loan.item_id,
      student_id: loan.student_id,
      borrower: user.role === "siswa" ? "Student" : studentMap.get(loan.student_id) || "Unknown",
      approved_at: loan.approved_at,
      returned_at: loan.returned_at,
      return_note: loan.return_note,
    }))

    return NextResponse.json<ApiResponse<HistoryEntry[]>>(
      {
        success: true,
        data: history,
        message: "History retrieved successfully",
      },
      { status: 200 },
    )
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to get item history",
      },
      { status: error.message.includes("Unauthorized") ? 401 : 500 },
    )
  }
}
