import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import type { ApiResponse } from "@/types/api";
import { getUserFromToken } from "@/lib/helper/getUserFromToken";

export async function PUT(req: Request) {
  try {
    const user = await getUserFromToken(req);
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Current password and new password are required",
        },
        { status: 400 }
      );
    }

    // First verify the current password
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Current password is incorrect",
        },
        { status: 401 }
      );
    }

    // Update the password
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to update password",
      },
      { status: error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
