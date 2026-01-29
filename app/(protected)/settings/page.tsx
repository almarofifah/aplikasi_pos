"use client";

import { useEffect, useState } from "react";

type Me = {
  id: string;
  email: string;
  username: string;
  role: string;
  profileImage?: string | null;
  theme?: string | null;
  fontSize?: number | null;
};

export default function SettingsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [theme, setTheme] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number | null>(16);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/users/me");
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setMe(data.user);
        setUsername(data.user.username || "");
        setProfileImage(data.user.profileImage || null);
        setTheme(data.user.theme || "light");
        setFontSize(data.user.fontSize ?? 16);
      } catch (err) {
        console.error(err);
        alert("Gagal memuat data pengguna");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { username, profileImage, theme, fontSize };
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      const { user } = await res.json();
      setMe(user);
      alert("✓ Perubahan tersimpan");
    } catch (err) {
      alert("❌ Gagal menyimpan perubahan");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) return alert("Password baru dan konfirmasi tidak cocok");
    try {
      setPwdLoading(true);
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e?.error || "Gagal mengganti password");
      }
      alert("✓ Password berhasil diubah");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      alert(`❌ ${err instanceof Error ? err.message : "Error"}`);
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) return <div className="p-8">Memuat...</div>;

  return (
    <main className="min-h-screen p-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>

        <section className="mb-8 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex flex-col items-center">
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profileImage} alt="profile" className="w-28 h-28 rounded-full object-cover mb-4" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-100 mb-4 flex items-center justify-center">No Image</div>
              )}
              <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
            </div>

            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                <input type="email" value={me?.email} readOnly className="w-full rounded-md border p-2 bg-gray-50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-md border p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Role</label>
                <input value={me?.role} readOnly className="w-full rounded-md border p-2 bg-gray-50" />
                <p className="text-xs text-gray-500 mt-1">Only ADMIN can change roles (server enforced).</p>
              </div>

              <div className="flex gap-2 mt-3">
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Menyimpan...' : 'Save'}</button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Theme</label>
              <select value={theme || 'light'} onChange={(e) => setTheme(e.target.value)} className="rounded-md border p-2 w-full">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Font Size</label>
              <input type="number" value={fontSize || 16} onChange={(e) => setFontSize(parseInt(e.target.value || '16'))} className="rounded-md border p-2 w-full" />
            </div>
          </div>
        </section>

        <section className="mb-8 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded-md border p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-md border p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-md border p-2" />
            </div>

            <div className="flex items-end">
              <button onClick={handleChangePassword} disabled={pwdLoading} className="px-4 py-2 bg-blue-600 text-white rounded">{pwdLoading ? 'Processing...' : 'Change Password'}</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}