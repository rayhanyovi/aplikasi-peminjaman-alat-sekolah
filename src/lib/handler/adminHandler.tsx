import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useAdminActions() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) setError(error.message);
    else setUsers(data);
  };

  const addUser = async (
    email: string,
    role: string,
    onSuccess: () => void
  ) => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const payload = {
        email,
        password: "password1234",
        role,
      };

      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session?.access_token,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menambah pengguna");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return {
    users,
    error,
    loading,
    fetchUsers,
    addUser,
    logout,
  };
}
