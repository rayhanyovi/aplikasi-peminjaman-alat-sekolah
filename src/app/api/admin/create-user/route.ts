import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserRoleFromToken } from "@/lib/helper/authHelper";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();

    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized: Token required" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];

    const userRole = await getUserRoleFromToken(token);
    if (userRole !== "superadmin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin role required" },
        { status: 403 }
      );
    }

    // Validasi input email dan role
    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { role },
      email_confirm: true,
    });

    // Tangani error jika ada
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    // Kirimkan response sukses dengan data pengguna baru
    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the user" },
      { status: 500 }
    );
  }
}
