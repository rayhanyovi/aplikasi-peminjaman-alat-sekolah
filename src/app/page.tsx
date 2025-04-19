// app/page.tsx

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Ambil profil berdasarkan user ID
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        setError("Gagal mendapatkan data profil");
        setLoading(false);
        return;
      }

      // Redirect berdasarkan role
      if (profile.role === "student") {
        router.push("/student/dashboard");
      } else if (profile.role === "admin" || profile.role === "superadmin") {
        router.push("/admin/dashboard");
      } else {
        setError("Role tidak dikenali");
      }

      setLoading(false);
    };

    checkUserRole();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return <div>Redirecting...</div>;
}
