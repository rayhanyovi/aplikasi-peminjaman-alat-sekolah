// app/api/items/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import type { ApiResponse } from "@/types/api";
import { getUserFromToken } from "@/lib/helper/getUserFromToken";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromToken(req);

  try {
    const id = params.id;

    // Fetch item detail
    const { data: item, error: itemError } = await supabaseAdmin
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    if (itemError) {
      throw new Error(itemError.message);
    }

    if (!item) {
      throw new Error("Item not found");
    }

    // Fetch loans related to the item, sekalian ambil borrower dari profiles
    const { data: loans, error: loansError } = await supabaseAdmin
      .from("loans")
      .select(
        `
        *,
        borrower:student_id (
          id,
          name,
          email
        )
      `
      )
      .eq("item_id", id);

    if (loansError) {
      throw new Error(loansError.message);
    }

    // Pisahin current_request & history
    const current_request =
      loans?.filter((loan) => loan.status === "pending") || [];
    const history =
      loans?.filter(
        (loan) => loan.status !== "pending" && loan.status !== "rejected"
      ) || [];

    return NextResponse.json<ApiResponse<any>>(
      {
        success: true,
        data: {
          item,
          current_request,
          history,
        },
        message: "Item retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to get item",
      },
      { status: error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
