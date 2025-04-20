"use client";

import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/lib/handler/authHandler";
import { useAdminActions } from "@/lib/handler/adminHandler";
import DashboardCard from "@/components/DashboardCard";

export default function AdminDashboard() {
  const router = useRouter();
  const [newUserEmail, setNewUserEmail] = useState("");
  const [role, setRole] = useState("siswa");

  const { user, error } = useAuthUser();
  const { users, fetchUsers, addUser, logout, loading } = useAdminActions();

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await addUser(newUserEmail, role, () => {
      alert("Pengguna berhasil ditambahkan!");
      setNewUserEmail("");
      setRole("siswa");
    });
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  useEffect(() => {
    if (user?.role === "superadmin") {
      fetchUsers();
    }
  }, [user]);

  const dummyUsers = [
    { email: "dummy1@example.com", role: "admin" },
    { email: "dummy2@example.com", role: "siswa" },
  ];

  if (!user) return <div className="p-6 text-gray-600">Loading user...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <DashboardCard
          title="User Management"
          icon={<ClipboardList size={20} />}
          stats={[`Total user: ${users?.length || 0}`, "Tambah & hapus user"]}
          link="/admin/users"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-semibold mb-1">Welcome, Admin</h1>
        <p className="text-gray-700">Email: {user.email}</p>
        <p className="text-gray-500">Role: {user.role}</p>
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 transition text-white rounded"
        >
          Logout
        </button>
      </div>

      {user.role === "superadmin" && (
        <div className="bg-white mt-8 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add New User</h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded mt-1 focus:ring focus:ring-blue-200 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded mt-1 focus:ring focus:ring-blue-200 outline-none"
              >
                <option value="siswa">Siswa</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className={`w-full py-2 rounded-md transition text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add User"}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white mt-8 p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">User List</h2>
        {users.length > 0 ? (
          <ul className="space-y-3">
            {users.map((u, index) => (
              <li
                key={index}
                className="flex justify-between items-center border px-4 py-3 rounded hover:bg-gray-50 transition"
              >
                <span className="font-medium">{u.email}</span>
                <span className="text-sm text-gray-500 capitalize">
                  {u.role}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-3 text-gray-600">
            {dummyUsers.map((u, index) => (
              <li
                key={index}
                className="flex justify-between items-center border px-4 py-3 rounded bg-gray-50"
              >
                <span className="font-medium">{u.email}</span>
                <span className="text-sm text-gray-400 capitalize">
                  {u.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
