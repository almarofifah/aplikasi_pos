"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UNSTABLE_REVALIDATE_RENAME_ERROR } from "next/dist/lib/constants";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1553531088-be7ad5f9e6e7?w=1400&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* OVERLAY */}
      <div className="absolute inset-0 "></div>

      {/* FORM CARD */}
      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* CARD BODY */}
          <div className="p-10 sm:p-12">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">P</div>
            </div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back!</h2>
              <p className="text-gray-500 text-sm">
                Please enter your username and password here
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>

                <div className="group bg-blue-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent transition duration-150 ease-in-out hover:shadow-md hover:border-blue-300">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full h-12 px-4 border border-transparent rounded-lg bg-transparent outline-none transition text-sm shadow-sm"
                    required
                  />
                </div> 
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative bg-blue-50 border border-gray-200 rounded-lg group transition duration-150 ease-in-out hover:shadow-md hover:border-blue-300">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 px-4 pr-10 bg-transparent outline-none focus:ring-2 focus:ring-blue-600 rounded-lg transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 group-hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.58 10.58a3 3 0 104.24 4.24" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12s4-7 10-7a9.96 9.96 0 017.24 3.06" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.12 14.12A3 3 0 0110.58 10.58" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-full hover:from-blue-700 hover:to-blue-600 disabled:opacity-60 transition transform hover:scale-105 active:scale-95 mt-6 shadow-md flex items-center justify-center"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/register" className="text-blue-600 font-semibold hover:underline">
                Register
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
