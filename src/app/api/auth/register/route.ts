// app/api/auth/register/route.ts
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseClient"
import type { ApiResponse, CreateUserRequest, User } from "@/types/api"
import { requireRole } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    // Only superadmin can create users
    await requireRole(req, ["superadmin"])

    const { email, password, role, name }: CreateUserRequest = await req.json()

    if (!email || !password || !role) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Email, password, and role are required",
        },
        { status: 400 },
      )
    }

    // Create user in auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (userError) {
      throw new Error(userError.message)
    }

    // Create profile
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        name: name || email.split("@")[0],
        role,
      })
      .eq("id", userData.user.id)
      .select()
      .single()

    if (profileError) {
      // Attempt to clean up the created user
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
      throw new Error(profileError.message)
    }

    return NextResponse.json<ApiResponse<User>>(
      {
        success: true,
        data: {
          id: userData.user.id,
          email: userData.user.email || "",
          name: profileData.name,
          role: profileData.role,
          created_at: userData.user.created_at,
        },
        message: "User created successfully",
      },
      { status: 201 },
    )
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to create user",
      },
      { status: error.message.includes("Unauthorized") ? 403 : 500 },
    )
  }
}
