// app/student/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAdminActions } from "@/lib/handler/adminHandler";

export default function StudentDashboard() {
  const router = useRouter();
  const { logout } = useAdminActions();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, Student</h1>
      <p>Email: {user.email}</p>
      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 transition text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}
