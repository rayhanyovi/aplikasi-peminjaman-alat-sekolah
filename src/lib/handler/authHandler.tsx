import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useAuthUser() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user?.id)
          .single();

        if (error) throw error;
        setUser(profile);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchUser();
  }, []);

  return { user, error };
}
