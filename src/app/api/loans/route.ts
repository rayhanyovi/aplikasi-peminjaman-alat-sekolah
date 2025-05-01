// app/api/loans/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import type { ApiResponse, Loan } from "@/types/api";
import { RequestLoanItemType } from "@/types/requestTypes";
import { getUserFromToken } from "@/lib/helper/getUserFromToken";

export async function GET(req: Request) {
  try {
    const user = await getUserFromToken(req);

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const validStatuses = ["pending", "approved", "rejected", "returned"];

    let query = supabaseAdmin.from("loans").select(
      `
        id, 
        item_id, 
        student_id, 
        status, 
        requested_at,
        request_note,
        expected_return_at,
        approved_at, 
        approved_by, 
        rejected_at, 
        rejected_by, 
        rejection_notice, 
        returned_at, 
        return_note,
        items:item_id (name, code, image),
        profiles:student_id (*)
      `,
      { count: "exact" }
    );

    if (status && validStatuses.includes(status)) {
      query = query.eq("status", status);
    }

    if (user.role === "siswa") {
      query = query.eq("student_id", user.id);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const loansWithStudent: RequestLoanItemType[] = data.map((loan: any) => {
      const { student_id, ...loanData } = loan;
      return {
        ...loanData,
        student: {
          id: loan.profiles.id,
          name: loan.profiles.name,
          role: loan.profiles.role,
          email: loan.profiles.email,
        },
        profiles: undefined,
      };
    });

    return NextResponse.json<ApiResponse<RequestLoanItemType[]>>(
      {
        success: true,
        message: "Loans retrieved successfully",
        data: loansWithStudent,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to get loans",
      },
      { status: error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
