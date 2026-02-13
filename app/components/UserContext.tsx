"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Me = {
  id: string;
  email: string;
  username: string;
  role: string;
  profileImage?: string | null;
  theme?: string | null;
  fontSize?: number | null;
};

type UserContextValue = {
  user: Me | null;
  setUser: (u: Me | null) => void;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);

  const fetchMe = async () => {
    try {
      const res = await fetch('/api/users/me');
      if (!res.ok) {
        console.warn('/api/users/me returned non-ok', res.status);
        // ensure we mark as loaded (null) so consumers can react accordingly
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error('Failed to refresh user', err);
      setUser(null);
    }
  };

  useEffect(() => {
    // initial load (wrapped in IIFE to avoid calling setState synchronously in effect body)
    (async () => {
      await fetchMe();
    })();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser: fetchMe }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
