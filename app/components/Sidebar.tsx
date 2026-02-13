"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { UtensilsCrossed, LayoutDashboard, Package, Settings, LogOut, Menu, X } from "lucide-react";
import { useUser } from "./UserContext";

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  const { user } = useUser();
  const role = user?.role || null;

  const menuItems = [
    { label: "Kasir", path: "/kasir", icon: UtensilsCrossed },
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Produk", path: "/admin/products", icon: Package },
    // show Users only for ADMIN
    ...(role === 'ADMIN' ? [{ label: 'Users', path: '/admin/users', icon: Settings }] : []),
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`${sidebarOpen ? "w-64" : "w-20"} bg-gradient-to-b from-blue-700 to-blue-900 text-white transition-all duration-300 fixed left-0 top-0 h-screen shadow-lg z-40`}
    >
      <div className="p-6 border-b border-blue-600">
        {sidebarOpen ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-blue-600">P</div>
              <h1 className="text-2xl font-bold">POS</h1>
            </div>

            <div>
              <button
                onClick={toggleSidebar}
                className="p-1 hover:bg-blue-600 rounded-lg transition"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-blue-600">P</div>
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-blue-600 rounded-lg transition"
              aria-label="Open sidebar"
              title="Open sidebar"
            >
              <Menu size={20} />
            </button>
          </div>
        )}
      </div>

      <nav className={`flex-1 px-4 py-6 space-y-2 ${sidebarOpen ? "" : "flex flex-col items-center px-2"}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.path || "") || false;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setSidebarOpen(false)}
              className={
                sidebarOpen
                  ? `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? "bg-blue-500 text-white" : "text-blue-100 hover:bg-blue-600"}`
                  : `flex items-center justify-center w-full p-3 rounded-lg transition ${isActive ? "bg-blue-500 text-white" : "text-blue-100 hover:bg-blue-600"}`
              }
            >
              <Icon size={20} aria-hidden="true" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-600">
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            // when logged out, close sidebar
            setSidebarOpen(false);
            location.href = '/login';
          }}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition text-white font-medium"
        >
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
