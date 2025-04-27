// app/api/items/[id]/route.ts
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import type { ApiResponse, Item, UpdateItemRequest } from "@/types/api"

// Get a specific item
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // Any authenticated user can get an item
    await requireRole(req, ["admin", "superadmin", "siswa"])

    const id = params.id

    const { data, error } = await supabaseAdmin.from("items").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: "Item not found",
          },
          { status: 404 },
        )
      }
      throw new Error(error.message)
    }

    return NextResponse.json<ApiResponse<Item>>(
      {
        success: true,
        data: data as Item,
        message: "Item retrieved successfully",
      },
      { status: 200 },
    )
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to get item",
      },
      { status: error.message.includes("Unauthorized") ? 401 : 500 },
    )
  }
}

// Update an item (superadmin only)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    // Ensure user is superadmin
    await requireRole(req, ["superadmin"])

    const id = params.id
    const updates: UpdateItemRequest = await req.json()

    if (Object.keys(updates).length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "No update data provided",
        },
        { status: 400 },
      )
    }

    // Check if item exists
    const { data: existingItem, error: checkError } = await supabaseAdmin
      .from("items")
      .select("id")
      .eq("id", id)
      .single()

    if (checkError || !existingItem) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Item not found",
        },
        { status: 404 },
      )
    }

    const { data, error } = await supabaseAdmin.from("items").update(updates).eq("id", id).select().single()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json<ApiResponse<Item>>(
      {
        success: true,
        data: data as Item,
        message: "Item updated successfully",
      },
      { status: 200 },
    )
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to update item",
      },
      { status: error.message.includes("Unauthorized") ? 403 : 500 },
    )
  }
}

// Delete an item (superadmin only)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // Ensure user is superadmin
    await requireRole(req, ["superadmin"])

    const id = params.id

    // Check if item exists
    const { data: existingItem, error: checkError } = await supabaseAdmin
      .from("items")
      .select("id, status")
      .eq("id", id)
      .single()

    if (checkError || !existingItem) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Item not found",
        },
        { status: 404 },
      )
    }

    // Don't allow deletion of borrowed items
    if (existingItem.status === "dipinjam") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Cannot delete an item that is currently borrowed",
        },
        { status: 400 },
      )
    }

    const { error } = await supabaseAdmin.from("items").delete().eq("id", id)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Item deleted successfully",
      },
      { status: 200 },
    )
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to delete item",
      },
      { status: error.message.includes("Unauthorized") ? 403 : 500 },
    )
  }
}
