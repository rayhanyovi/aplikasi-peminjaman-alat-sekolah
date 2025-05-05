import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const id = formData.get("id") as string;

    if (!file) {
      console.warn("[API] Missing file");
      return NextResponse.json(
        { success: false, error: "Missing file" },
        { status: 400 }
      );
    }

    if (!type) {
      console.warn("[API] Missing type");
      return NextResponse.json(
        { success: false, error: "Missing type" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileExt = "webp";
    const fileName = `${id}.${fileExt}`;
    const filePath = `${type}/${fileName}`;

    // Add metadata to track file size
    const fileSizeKB = Math.round(arrayBuffer.byteLength / 1024);

    const { error } = await supabaseAdmin.storage
      .from("images")
      .upload(filePath, arrayBuffer, {
        contentType: "image/webp",
        upsert: true,
        cacheControl: "3600", // Add cache control for better performance
      });

    if (error) {
      console.error("[API] Upload error:", error.message);
      throw error;
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("images")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      size: fileSizeKB,
    });
  } catch (err: any) {
    console.error("[API] Fatal error:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
