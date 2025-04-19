"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [role, setRole] = useState("user"); // Default role for new user
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (profileError) {
        setError(profileError.message);
      }
      if (error) {
        setError(error.message);
      } else {
        setUser(profile);
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      // Ambil daftar pengguna hanya jika superadmin
      const getUsers = async () => {
        const { data, error } = await supabase.from("profiles").select("*");
        if (error) {
          setError(error.message);
        } else {
          // Mengambil data dari 'data' yang merupakan array pengguna
          setUsers(data);
        }
      };

      // Jika user memiliki role 'superadmin', dapat mengambil data pengguna
      if (user.role === "superadmin") {
        getUsers();
      }
    }
  }, [user]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;

    const payload = JSON.stringify({
      email: newUserEmail,
      password: "password1234",
      role: role,
    });

    try {
      // Mengirimkan data ke API untuk menambahkan pengguna baru
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        body: payload,
      });

      const data = await response.json();

      if (response.ok) {
        // Tanggapan sukses
        alert("Pengguna berhasil ditambahkan!");
        // Reset form setelah berhasil
        setNewUserEmail("");
        setRole("user");
      } else {
        // Tangani error jika ada
        setError(data.message || "Terjadi kesalahan saat menambah pengguna");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat menambah pengguna");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Welcome, Admin</h1>
      <p onClick={() => console.log(user)}>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <button
        onClick={logout}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
      >
        Logout
      </button>

      {/* Form untuk menambahkan pengguna baru */}
      {user.role === "superadmin" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Add New User</h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="mt-1 px-4 py-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div>
              <label>Role:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 px-4 py-2 border border-gray-300 rounded"
              >
                <option value="student">Siswa</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className={`w-full py-2 px-4 rounded-md ${
                  loading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Pengguna */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">User List</h2>
        <ul className="mt-2 space-y-2">
          {users.length > 0 ? (
            users.map((user, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{user.email}</span>
                <span className="text-sm text-gray-500">{user.role}</span>
              </li>
            ))
          ) : (
            <p>No users found.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
