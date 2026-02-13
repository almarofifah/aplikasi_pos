"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

type SidebarContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Start closed on server to avoid hydration mismatch. After mount we will read
  // the user's preference or window size and update accordingly.
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Sync initial value on client after mount (reads localStorage/window).
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sidebarOpen");
      if (stored !== null) {
        setSidebarOpen(stored === "true");
        return;
      }
      // fallback to screen width on first load
      if (typeof window !== "undefined") {
        setSidebarOpen(window.innerWidth >= 768);
      }
    } catch {
      // ignore
    }
  }, []);
  const pathname = usePathname();

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem("sidebarOpen", String(sidebarOpen));
    } catch {
      // ignore
    }
  }, [sidebarOpen]);

  const prevPathRef = useRef<string | null>(null);

  // Close when route changes (only if it is open)
  useEffect(() => {
    if (pathname && prevPathRef.current !== null && prevPathRef.current !== pathname && sidebarOpen) {
      // delay to avoid synchronous state update during render lifecycle
      const t = setTimeout(() => setSidebarOpen(false));
      return () => clearTimeout(t);
    }
    prevPathRef.current = pathname;
  }, [pathname, sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen((s) => !s);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
