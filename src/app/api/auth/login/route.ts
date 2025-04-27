// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import type { ApiResponse, LoginRequest, LoginResponse } from "@/types/api";

export async function POST(req: Request) {
  try {
    const { email, password }: LoginRequest = await req.json();

    if (!email || !password) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message,
        },
        { status: 401 }
      );
    }

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, email, role")
      .eq("id", data.user?.id)
      .single();

    if (profileError) {
      console.error("Profile Fetch Error:", profileError.message);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Failed to get user profile",
        },
        { status: 500 }
      );
    }

    // Response payload
    const response: LoginResponse = {
      user: {
        id: data.user.id,
        email: data.user.email || "",
        name: profile.name || "",
        role: profile.role,
      },
      session: {
        access_token: data.session.access_token,
        expires_at: data.session.expires_at ?? 0,
      },
    };

    // Set the HTTP-only cookie for access token
    const nextResponse = NextResponse.json<ApiResponse<LoginResponse>>(
      {
        success: true,
        data: response,
        message: "Login successful",
      },
      { status: 200 }
    );

    // Set Cookie header for the access token (HttpOnly, Secure, SameSite)
    nextResponse.cookies.set("access_token", data.session.access_token, {
      httpOnly: true, // Make the cookie accessible only via HTTP(S), not JavaScript
      secure: process.env.NODE_ENV === "production", // Use secure flag in production
      path: "/", // Cookie will be sent for all routes
      maxAge: data.session.expires_at ?? 0, // Expiry time from session
      sameSite: "strict", // Corrected casing of SameSite value
    });

    return nextResponse;
  } catch (error: any) {
    console.error("Unexpected Error:", error.message);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "An error occurred during login",
      },
      { status: 500 }
    );
  }
}
