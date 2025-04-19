import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return new Response(
        JSON.stringify({ message: "Error", error: error.message }),
        { status: 500 }
      );
    }

    if (data) {
      return new Response(
        JSON.stringify({ message: "User connected", user: data }),
        { status: 200 }
      );
    } else {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "Error connecting to Supabase",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
