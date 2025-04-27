// app/api/items/route.ts
import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseClient";
import type { ApiResponse, CreateItemRequest, Item } from "@/types/api";
import { getUserFromToken } from "@/lib/helper/getUserFromToken";

export async function GET(req: Request) {
  const user = await getUserFromToken(req);

  try {
    const { data: items, error } = await supabaseAdmin
      .from("items")
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    // If user is a student, don't show who borrowed items
    const processedItems = items.map((item) => {
      if (user.role == "siswa" && item.borrowed_by !== user.id) {
        return { ...item, borrowed_by: null };
      }
      return item;
    });

    return NextResponse.json<ApiResponse<Item[]>>(
      {
        success: true,
        data: processedItems as Item[],
        message: "Items retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to get items",
      },
      { status: error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
