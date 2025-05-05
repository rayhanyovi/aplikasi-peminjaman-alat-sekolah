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
    const pageParam = url.searchParams.get("page") || "1";
    const limitParam = url.searchParams.get("limit") || "10";

    const page = parseInt(pageParam, 10);
    const limit = parseInt(limitParam, 10);
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("loans")
      .select(
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
        profiles:student_id (*),
        approved_profiles:approved_by (name, role)
      `,
        { count: "exact" }
      )
      .range(offset, offset + limit - 1)
      .order("last_activity_at", { ascending: true });

    if (status) {
      const statuses = status.split(",");
      if (statuses.every((s) => validStatuses.includes(s))) {
        query = query.in("status", statuses);
      } else {
        query = query.eq("status", status);
      }
    }

    if (user.role === "siswa") {
      query = query.eq("student_id", user.id);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const loansWithStudent: RequestLoanItemType[] = data.map((loan: any) => {
      const { student_id, approved_by, ...loanData } = loan;
      return {
        ...loanData,
        student: {
          id: loan.profiles.id,
          name: loan.profiles.name,
          role: loan.profiles.role,
          email: loan.profiles.email,
        },
        approved_by: approved_by
          ? {
              // Jika approved_by tidak null
              name: loan.approved_profiles.name,
              role: loan.approved_profiles.role,
            }
          : null,
        profiles: undefined,
        approved_profiles: undefined, // Menghapus profiles yang terkait dengan approved_by setelah digunakan
      };
    });

    const totalCount = count ?? 0;

    return NextResponse.json<ApiResponse<RequestLoanItemType[]>>(
      {
        success: true,
        message: "Loans retrieved successfully",
        count: totalCount,
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
