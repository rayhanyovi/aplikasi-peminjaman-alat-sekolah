// app/api/items/add/route.tsx
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { getUserFromToken } from "@/lib/helper/getUserFromToken";
import type { ApiResponse } from "@/types/api";

export async function POST(req: Request) {
  const user = await getUserFromToken(req);

  try {
    const body = await req.json();

    const { name, code, image } = body;

    // Validasi minimal
    if (!name || !code) {
      throw new Error("Name and code are required");
    }

    const { data, error } = await supabaseAdmin.from("items").insert([
      {
        name,
        code,
        image,
        status: "tersedia", // Optional karena default, tapi kasih explisit lebih aman
        borrowed_by: null, // Optional, null by default
      },
    ]);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json<ApiResponse<any>>(
      {
        success: true,
        data,
        message: "Item added successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to add item",
      },
      { status: error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
