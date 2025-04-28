import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import type { ApiResponse } from "@/types/api";

export async function GET(req: Request) {
  try {
    const { count, error } = await supabaseAdmin
      .from("items")
      .select("*", { count: "exact", head: true })
      .eq("status", "dipinjam");

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { count: count },
      message: "Total loans count retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching total loans count:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to get total loans count",
      },
      { status: error.message.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
