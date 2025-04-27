// Create a new item (superadmin only)
export async function POST(req: Request) {
  try {
    // Ensure user is superadmin
    await requireRole(req, ["superadmin"]);

    const { name, code, image }: CreateItemRequest = await req.json();

    if (!name || !code) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Name and code are required",
        },
        { status: 400 }
      );
    }

    // Check if code already exists
    const { data: existingItem } = await supabaseAdmin
      .from("items")
      .select("id")
      .eq("code", code)
      .single();

    if (existingItem) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "An item with this code already exists",
        },
        { status: 409 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("items")
      .insert({
        name,
        code,
        image: image || "",
        status: "tersedia",
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json<ApiResponse<Item>>(
      {
        success: true,
        data: data as Item,
        message: "Item created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Failed to create item",
      },
      { status: error.message.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
