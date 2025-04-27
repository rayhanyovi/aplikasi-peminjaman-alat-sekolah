// app/api/items/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import type { ApiResponse, Item } from "@/types/api";
import { getUserFromToken } from "@/lib/helper/getUserFromToken";

export async function GET(req: Request) {
  const user = await getUserFromToken(req);

  try {
    const url = new URL(req.url);

    const status = url.searchParams.get("status");
    const limitParam = url.searchParams.get("limit") || "10";
    const pageParam = url.searchParams.get("page") || "1";

    const limit = parseInt(limitParam, 10);
    const page = parseInt(pageParam, 10);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin.from("items").select("*", { count: "exact" }); // count: "exact" needed for total rows

    if (status) {
      query = query.eq("status", status);
    }

    query = query.range(from, to);

    const { data: items, count, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (!items) {
      throw new Error("No items found");
    }

    // Hide 'borrowed_by' for students
    const processedItems = items.map((item) => {
      if (user.role === "siswa" && item.borrowed_by !== user.id) {
        return { ...item, borrowed_by: null };
      }
      return item;
    });

    const totalCount = count || 0;
    const next = page * limit < totalCount;
    const prev = page > 1;

    return NextResponse.json<ApiResponse<Item[]>>(
      {
        success: true,
        data: processedItems as Item[],
        next,
        prev,
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
