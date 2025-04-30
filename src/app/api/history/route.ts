// app/api/loans/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import type { ApiResponse, Item, Loan } from "@/types/api";
import { RequestLoanItemType } from "@/types/requestTypes";
import { getUserFromToken } from "@/lib/helper/getUserFromToken";
export async function GET(req: Request) {
  try {
    console.debug("🔍 Incoming request:", req.url);

    const user = await getUserFromToken(req);
    const userRole = user.role;
    console.debug("👤 Decoded user role:", userRole);

    const url = new URL(req.url);
    // const status = url.searchParams.get("status");
    const limitParam = url.searchParams.get("limit") || "10";
    const pageParam = url.searchParams.get("page") || "1";
    const validStatuses = ["pending", "approved", "rejected", "returned"];

    const limit = parseInt(limitParam);
    const page = parseInt(pageParam);
    console.debug("📄 Pagination info:", { page, limit });

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin.from("loans").select(`
  id, 
  item_id, 
  student_id, 
  status, 
  requested_at, 
  approved_at, 
  approved_by, 
  rejected_at, 
  rejected_by, 
  rejection_notice, 
  returned_at, 
  return_note,
  items:item_id (name, image)
`);

    // if (status && validStatuses.includes(status)) {
    //   query = query.eq("status", status);
    //   console.debug("📌 Filtering by status:", status);
    // }

    if (userRole === "siswa") {
      query = query.eq("student_id", userRole);
      console.debug("📌 Filtering by student_id (siswa):", userRole);
    }

    query = query.range(from, to);

    const { data, error } = await query.order("requested_at", {
      ascending: false,
    });

    if (error) {
      console.error("❌ Supabase error:", error.message);
      throw new Error(error.message);
    }

    console.debug("✅ Data fetched:", data);

    const loansWithStudent: RequestLoanItemType[] = data.map((loan: any) => {
      const { student_id, ...loanData } = loan;
      return {
        ...loanData,
        profiles: undefined,
      };
    });

    return NextResponse.json<ApiResponse<RequestLoanItemType[]>>(
      {
        success: true,
        data: loansWithStudent,
        message: "Loans retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("💥 Error in GET /loans:", error.message);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to get loans",
      },
      { status: error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
