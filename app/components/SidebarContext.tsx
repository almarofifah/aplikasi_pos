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
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("sidebarOpen");
        if (stored !== null) return stored === "true";
        return window.innerWidth >= 768;
      } catch {
        return false;
      }
    }
    return false;
  });
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
