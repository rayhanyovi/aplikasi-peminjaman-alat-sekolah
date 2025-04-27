import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import type { ApiResponse, User } from "@/types/api";

// Get all users (superadmin only)
export async function GET(req: Request) {
  try {
    console.debug("Starting to fetch users from Supabase...");
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, name, email, role, created_at");

    if (error) {
      throw new Error(error.message);
    }

    console.debug("Fetched users data:", data);
    return NextResponse.json<ApiResponse<User[]>>(
      {
        success: true,
        data: data as User[],
        message: "Users retrieved successfully",
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
