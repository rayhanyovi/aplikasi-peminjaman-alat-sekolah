import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.warn("[API] Missing file");
      return NextResponse.json(
        { success: false, error: "Missing file" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileExt = "webp";
    const timestamp = Date.now(); // atau bisa pakai uuid kalau mau lebih aman
    const fileName = `image_${timestamp}.${fileExt}`;
    const filePath = `items/${fileName}`;

    const { error } = await supabaseAdmin.storage
      .from("images.item")
      .upload(filePath, arrayBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (error) {
      console.error("[API] Upload error:", error.message);
      throw error;
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("images.item") // Pastikan menggunakan bucket yang sama
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
    });
  } catch (err: any) {
    console.error("[API] Fatal error:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
