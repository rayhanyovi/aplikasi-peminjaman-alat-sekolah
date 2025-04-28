// app/api/items/add/route.tsx
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { getUserFromToken } from "@/lib/helper/getUserFromToken";
import type { ApiResponse } from "@/types/api";

export async function POST(req: Request) {
  const user = await getUserFromToken(req);

  try {
    const body = await req.json();

    const { email, password, role, name } = body;

    if (!email || !password || !role) {
      throw new Error("Name and code are required");
    }

    if (user.role !== "superadmin") {
      throw new Error("You are not authorized to perform this action");
    }

    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { role, full_name: name },
      email_confirm: true,
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json<ApiResponse<any>>(
      {
        success: true,
        data: newUser,
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
