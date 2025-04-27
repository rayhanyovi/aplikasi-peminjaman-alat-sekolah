import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (error) {
      return NextResponse.json({ message: "Error getting role", error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "User connected", user: { id: user.id, role: data.role } }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: "Unexpected error", error: error.message }, { status: 500 })
  }
}
