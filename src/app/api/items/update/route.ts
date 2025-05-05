// app/api/items/update/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { getUserFromToken } from "@/lib/helper/getUserFromToken";
import type { ApiResponse } from "@/types/api";

export async function PUT(req: Request) {
  try {
    const user = await getUserFromToken(req);

    // Only superadmin can update items
    if (user.role !== "superadmin") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "You are not authorized to update items",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, name, code, image } = body;

    if (!id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Item ID is required",
        },
        { status: 400 }
      );
    }

    // Check if item exists
    const { data: existingItem, error: checkError } = await supabaseAdmin
      .from("items")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !existingItem) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Item not found",
        },
        { status: 404 }
      );
    }

    // Prepare update data (only include fields that are provided)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (image !== undefined) updateData.image = image;

    // Update the item
    const { data, error } = await supabaseAdmin
      .from("items")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data,
        message: "Item updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to update item",
      },
      { status: error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
