"use client";

import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import HeadSidebar from './HeadSidebar';
import { Menu, Bell, ChevronDown, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';



export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, forwarded: 0 });

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => res.json())
      .then((userData) => setUser(userData))
      .catch((err) => console.error("Failed to fetch user:", err));

    // Fetch stats
    fetch('/api/admin/agendas?status=PENDING&page=1&pageSize=1', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setStats({ ...stats, pending: data.total || 0 }))
      .catch(() => setStats({ ...stats, pending: 0 }));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Hidden on mobile, shown on md+ or when toggled */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block fixed md:relative z-50 md:z-auto`}>
        <HeadSidebar user={user} />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
                  Welcome{user?.name ? `, ${user.name}` : ""} 👋
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  You have {stats.pending} approval task{stats.pending === 1 ? "" : "s"} waiting.
                </p>
                {actionError && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              <span className="font-semibold">Error:</span> {actionError}
            </div>
               )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative text-gray-500 hover:text-gray-700">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name ? user.name[0].toUpperCase() : 'H'}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="font-semibold">{user?.name || 'Head User'}</div>
                      <div className="text-sm text-gray-500">Head</div>
                    </div>
                    <button className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}