import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import type { ApiResponse, User } from "@/types/api";

// Get all users (superadmin only)
export async function GET(req: Request) {
  const url = new URL(req.url);

  try {
    const role = url.searchParams.get("role");
    const name = url.searchParams.get("name");
    const email = url.searchParams.get("email");

    const limitParam = url.searchParams.get("limit") || "10";
    const pageParam = url.searchParams.get("page") || "1";

    const limit = parseInt(limitParam);
    const page = parseInt(pageParam);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const query = supabaseAdmin
      .from("profiles")
      .select("id, name, email, role, created_at", { count: "exact" })
      .range(from, to);


      
    if (role) {
      query.eq("role", role);
    }

    if (name) {
      query.ilike("name", `%${name}%`);
    }

    if (email) {
      query.ilike("email", `%${email}%`);
    }

    const { data, count, error } = await query;

    const totalCount = count || 0;
    const next = page * limit < totalCount;
    const prev = page > 1;

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json<ApiResponse<User[]>>(
      {
        success: true,
        message: "Users retrieved successfully",
        count: totalCount,
        next,
        prev,
        data: data as User[],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to get users",
      },
      { status: error.message.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
