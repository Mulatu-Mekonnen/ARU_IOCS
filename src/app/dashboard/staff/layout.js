"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, Bell, ChevronDown, User, LogOut } from "lucide-react";
import StaffSidebar from "./StaffSidebar";

export default function StaffLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notificationStats, setNotificationStats] = useState({ unread: 0 });

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => res.json())
      .then((userData) => setUser(userData))
      .catch((err) => console.error("Failed to fetch user:", err));

    const fetchNotificationStats = async () => {
      try {
        const r = await fetch("/api/dashboard/staff/notifications", { credentials: "include" });
        if (!r.ok) return setNotificationStats({ unread: 0 });
        const data = await r.json();
        setNotificationStats({ unread: data.stats?.unread || 0 });
      } catch (error) {
        setNotificationStats({ unread: 0 });
      }
    };

    fetchNotificationStats();
    const interval = setInterval(fetchNotificationStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:inset-0`}>
        <StaffSidebar />
      </div>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-gray-500 hover:text-gray-700">
                <Menu className="w-6 h-6" />
              </button>
            
              <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome{user?.name ? `, ${user.name}` : ""} 👋</h1>
          <p className="text-sm text-gray-600">{pathname}</p>
          <p className="text-gray-600 mt-1">Create and manage your communications</p>
        </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/staff/notifications" className="relative text-gray-500 hover:text-gray-700">
                <Bell className="w-6 h-6" />
                {notificationStats.unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationStats.unread > 99 ? "99+" : notificationStats.unread}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name ? user.name[0].toUpperCase() : "S"}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="font-semibold">{user?.name || "Staff User"}</div>
                      <div className="text-sm text-gray-500">Staff</div>
                    </div>
                    <button className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-red-50 hover:text-red-600">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
