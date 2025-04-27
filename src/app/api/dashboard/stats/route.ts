import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import type { ApiResponse } from "@/types/api";

export async function GET(req: Request) {
  try {
    //get total items
    const { count: itemsCount, error: itemsError } = await supabaseAdmin
      .from("items")
      .select("*", { count: "exact", head: true });

    if (itemsError) {
      console.log(itemsError?.message);
      throw new Error(itemsError.message);
    }

    //get loaned items
    const { count: loanCount, error: loanError } = await supabaseAdmin
      .from("items")
      .select("*", { count: "exact", head: true })
      .eq("status", "dipinjam");

    if (loanError) {
      console.log(loanError?.message);
      throw new Error(loanError.message);
    }

    //get loaned items
    const { count: requestCount, error: requestError } = await supabaseAdmin
      .from("loans")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (requestError) {
      console.log(requestError?.message);
      throw new Error(requestError.message);
    }

    // Get total users
    const { count: userCount, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (userError) {
      console.log(userError?.message);
      throw new Error(userError.message);
    }

    const stats = {
      loanCount,
      userCount,
      requestCount,
      itemsCount,
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: stats,
      message: "Dashboard statistics retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching dashboard statistics:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to get dashboard statistics",
      },
      { status: error.message.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
