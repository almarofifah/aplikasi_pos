"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  username: string;
  role: string;
  profileImage?: string | null;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [me, setMe] = useState<{ role?: string } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/users/me");
        if (!res.ok) return setMe(null);
        const body = await res.json();
        setMe(body.user);

        if (body.user?.role !== "ADMIN") return;

        const r2 = await fetch("/api/admin/users");
        if (!r2.ok) throw new Error("Failed to fetch users");
        const d2 = await r2.json();
        setUsers(d2.users || []);
      } catch (err) {
        console.error(err);
        alert("Gagal memuat data pengguna");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRoleChangeLocal = (id: string, role: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  const handleSave = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    try {
      setSavingId(id);
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: user.role }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      alert("✓ Role updated");
    } catch (err) {
      alert("❌ Gagal memperbarui role");
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className="p-6">Memuat...</div>;
  if (!me || me.role !== "ADMIN") return <div className="p-6">Unauthorized. Admins only.</div>;

  return (
    <main className="min-h-screen p-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>

        <div className="overflow-x-auto border rounded">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-3 flex items-center gap-3">
                    {u.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.profileImage} alt={u.username} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">{u.username?.charAt(0).toUpperCase()}</div>
                    )}
                    <div>
                      <div className="font-medium">{u.username}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={(e) => handleRoleChangeLocal(u.id, e.target.value)} className="rounded border p-2">
                      <option value="CASHIER">CASHIER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">{new Date(u.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleSave(u.id)} disabled={savingId === u.id} className="px-3 py-1 bg-blue-600 text-white rounded">{savingId === u.id ? 'Saving...' : 'Save'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}