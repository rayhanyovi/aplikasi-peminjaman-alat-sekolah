import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json(
    { message: "Item deleted", success: true },
    { status: 200 }
  );
}
