// app/api/auth/me/route.ts
import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import type { ApiResponse, User } from "@/types/api"

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req)

    return NextResponse.json<ApiResponse<User>>(
      {
        success: true,
        data: user as User,
        message: "User data retrieved successfully",
      },
      { status: 200 },
    )
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to get user data",
      },
      { status: error.message.includes("Unauthorized") ? 401 : 500 },
    )
  }
}
