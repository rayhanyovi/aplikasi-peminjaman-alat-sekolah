import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request) {
  try {
    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json(
        { message: "Item ID is required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized: Token required" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", user?.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { message: "User not found or invalid token" },
        { status: 404 }
      );
    }

    const { data: item, error: itemError } = await supabaseAdmin
      .from("items")
      .select("id, status")
      .eq("id", itemId)
      .single();

    if (itemError) {
      return NextResponse.json({ message: itemError.message }, { status: 500 });
    }

    if (!item || item.status !== "tersedia") {
      return NextResponse.json(
        { message: "Item is not available for loan" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("loans").insert({
      item_id: item.id,
      student_id: user.id,
      status: "pending",
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Loan request created successfully",
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing loan request:", error);
    return NextResponse.json(
      { message: "An error occurred while processing the loan request" },
      { status: 500 }
    );
  }
}
