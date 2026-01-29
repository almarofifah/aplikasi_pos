"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "../components/SidebarContext";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../components/SidebarContext";

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
    // Check if token exists, if not redirect to login
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <SidebarProvider>
      <ProtectedShell>{children}</ProtectedShell>
    </SidebarProvider>
  );
}
