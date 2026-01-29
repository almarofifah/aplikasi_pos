"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type SidebarContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const getInitial = () => {
    try {
      const stored = localStorage.getItem("sidebarOpen");
      if (stored !== null) return stored === "true";
    } catch {
      // ignore
    }
    // default closed on small screens
    if (typeof window !== "undefined") return window.innerWidth >= 768;
    return true;
  };

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => getInitial());
  const pathname = usePathname();

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem("sidebarOpen", String(sidebarOpen));
    } catch {
      // ignore
    }
  }, [sidebarOpen]);

  // Close when route changes (only if it is open)
  useEffect(() => {
    if (pathname && sidebarOpen) {
      // delay to avoid synchronous state update during render lifecycle
      const t = setTimeout(() => setSidebarOpen(false));
      return () => clearTimeout(t);
    }
    return;
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
