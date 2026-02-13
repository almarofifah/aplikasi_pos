"use client";

import { SidebarProvider, useSidebar } from "../../components/SidebarContext";
import Sidebar from "../../components/Sidebar";

function AdminShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useSidebar();
  return (
    <div className="flex">
      <Sidebar />
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>{children}</main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminShell>{children}</AdminShell>
    </SidebarProvider>
  );
}
