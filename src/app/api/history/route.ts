import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import type { ApiResponse } from "@/types/api";
import { RequestLoanItemType } from "@/types/requestTypes";
import { getUserFromToken } from "@/lib/helper/getUserFromToken";

export async function GET(req: Request) {
  try {
    console.debug("🔍 Incoming request:", req.url);

    const user = await getUserFromToken(req);
    const userRole = user.role;
    console.debug("👤 Decoded user role:", userRole);

    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit") || "10";
    const pageParam = url.searchParams.get("page") || "1";
    const status = url.searchParams.get("status");
    const name = url.searchParams.get("name");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const validStatuses = ["pending", "approved", "rejected", "returned"];
    const limit = parseInt(limitParam);
    const page = parseInt(pageParam);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Optional: Get matching item IDs if name is provided
    let matchingItemIds: number[] | undefined;
    if (name) {
      const { data: items, error: itemError } = await supabaseAdmin
        .from("items")
        .select("id")
        .ilike("name", `%${name}%`);

      if (itemError) throw new Error(itemError.message);
      matchingItemIds = items?.map((item) => item.id);

      // If no items match, return early with empty data
      if (!matchingItemIds || matchingItemIds.length === 0) {
        return NextResponse.json<ApiResponse<RequestLoanItemType[]>>({
          success: true,
          count: 0,
          data: [],
          message: "No loans match the provided item name",
        });
      }
    }

    let query = supabaseAdmin.from("loans").select(
      `
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
      `,
      { count: "exact" }
    );

    // Apply filters
    if (userRole === "siswa") {
      query = query.eq("student_id", user.id);
    }

    if (status && validStatuses.includes(status)) {
      query = query.eq("status", status);
    }

    if (startDate) {
      query = query.gte("requested_at", startDate);
    }

    if (endDate) {
      query = query.lte("requested_at", endDate);
    }

    if (matchingItemIds) {
      query = query.in("item_id", matchingItemIds);
    }

    query = query.range(from, to).order("requested_at", { ascending: false });

    const { data, count, error } = await query;

    if (error) {
      console.error("❌ Supabase error:", error.message);
      throw new Error(error.message);
    }

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
        count: count ?? 0,
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
