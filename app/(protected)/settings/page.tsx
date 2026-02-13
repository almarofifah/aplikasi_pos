"use client";

import { useEffect, useState } from "react";
import { useUser } from "../../components/UserContext";



export default function SettingsPage() {
  const { user, setUser } = useUser();
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [theme, setTheme] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number | null>(16);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [validation, setValidation] = useState<{ username?: string } | null>(null);

  // password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  // initialize form values from global user
  useEffect(() => {
    if (user === null) {
      // not authenticated or failed to load user; stop loading to avoid stuck state
      setLoading(false);
      return;
    }
    if (!user) return;
    setUsername(user.username || "");
    setProfileImage(user.profileImage || null);
    setTheme(user.theme || "light");
    setFontSize(user.fontSize ?? 16);
    setLoading(false);
  }, [user]);

  // auto-dismiss notices
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // auto-dismiss notices
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!username || username.trim().length === 0) {
      setValidation({ username: 'Username tidak boleh kosong' });
      return;
    }

    try {
      setSaving(true);
      const payload = { username, profileImage, theme, fontSize };
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error || 'Failed to save');
      }
      const { user: updated } = await res.json();
      // update global user so other pages reflect changes immediately
      setUser(updated);
      setNotice({ type: 'success', text: 'Perubahan tersimpan' });
      setValidation(null);
    } catch (err) {
      setNotice({ type: 'error', text: 'Gagal menyimpan perubahan' });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePhoto = () => {
    setProfileImage(null);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { setNotice({ type: 'error', text: 'Password baru dan konfirmasi tidak cocok' }); return; }
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
      setNotice({ type: 'success', text: 'Password berhasil diubah' });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Error' });
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) return <div className="p-8">Memuat...</div>;

  return (
    <main className="min-h-screen p-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>

        {notice && (
          <div className={`mb-4 p-3 rounded ${notice.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {notice.text}
          </div>
        )}

        <section className="mb-8 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex flex-col items-center">
              <div className="relative">
                {profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profileImage} alt="profile" className="w-28 h-28 rounded-full object-cover mb-4 transition-transform transform hover:scale-105" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gray-100 mb-4 flex items-center justify-center">No Image</div>
                )}
                <div className="absolute -bottom-1 right-0 flex gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded shadow text-sm cursor-pointer border border-gray-200 hover:bg-blue-50 transition">
                    <input className="hidden" type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
                    Choose
                  </label>
                  {profileImage && (
                    <button type="button" onClick={handleRemovePhoto} className="px-3 py-1 bg-red-50 text-red-700 rounded border border-red-100 text-sm hover:bg-red-100 transition">Remove</button>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                <input type="email" value={user?.email} readOnly className="w-full rounded-md border p-2 bg-gray-50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-200 transition" />
                {validation?.username && <p className="text-xs text-red-600 mt-1">{validation.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Role</label>
                <input value={user?.role} readOnly className="w-full rounded-md border p-2 bg-gray-50" />
                <p className="text-xs text-gray-500 mt-1">Only ADMIN can change roles (server enforced).</p>
              </div>

              <div className="flex gap-2 mt-3">
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300">{saving ? 'Menyimpan...' : 'Save'}</button>
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
              <button onClick={handleChangePassword} disabled={pwdLoading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300">{pwdLoading ? 'Processing...' : 'Change Password'}</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}