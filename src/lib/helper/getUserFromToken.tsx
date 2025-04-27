// lib/auth.ts
import { supabaseAdmin, supabase } from "@/lib/supabaseClient";
import { UserProfilesType } from "@/types/userTypes";
import type { NextRequest } from "next/server";

export const getUserFromToken = async (req: Request) => {
  const cookies = req.headers.get("cookie");
  if (!cookies) {
    throw new Error("No cookies found in the request");
  }

  // Find the access_token from the cookies
  const accessTokenMatch = cookies.match(/access_token=([^;]+)/);
  const token = accessTokenMatch ? accessTokenMatch[1] : null;

  if (!token) {
    throw new Error("Authorization token is missing");
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error) {
    throw new Error("Failed to retrieve user details");
  }

  const { data: user, error: errorProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (errorProfile) {
    throw new Error("Failed to retrieve user details");
  }

  return user as UserProfilesType; // Assuming the role is part of the user data
};
