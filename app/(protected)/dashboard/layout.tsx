"use client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Sidebar is provided by (protected) layout as shared component
  return <>{children}</>;
}
