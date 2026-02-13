"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "../components/SidebarContext";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../components/SidebarContext";
import { UserProvider } from "../components/UserContext";

function ProtectedShell({ children }: { children: React.ReactNode }) {
  // inside provider so we can use the hook
  const { sidebarOpen } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>{children}</main>
    </div>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Verify auth by calling the user endpoint. If unauthorized, redirect to login.
    (async () => {
      try {
        const res = await fetch('/api/users/me');
        if (!res.ok) {
          router.push('/login');
        }
      } catch (err) {
        router.push('/login');
      }
    })();
  }, [router]);

  return (
    <SidebarProvider>
      <UserProvider>
        <ProtectedShell>{children}</ProtectedShell>
      </UserProvider>
    </SidebarProvider>
  );
}
