import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import type { ApiResponse } from "@/types/api";
import { getUserFromToken } from "@/lib/helper/getUserFromToken";

export async function GET(req: Request) {
  try {
    const user = await getUserFromToken(req);

    // Get user profile data
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, name, email, role, avatar_url")
      .eq("id", user.id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: "Profile retrieved successfully",
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to get profile",
      },
      { status: error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getUserFromToken(req);
    const body = await req.json();

    // Only allow updating avatar_url
    const { avatar_url } = body;

    if (!avatar_url) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "No data provided for update",
        },
        { status: 400 }
      );
    }

    // Update profile
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ avatar_url })
      .eq("id", user.id)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to update profile",
      },
      { status: error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
