import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Building,
  Megaphone,
  FileText,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  CheckCircle,
  Archive
} from "lucide-react";

export default function HeadLayout({ children }) {
  const { url, props } = usePage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState(props.auth?.user || null);
  const [notificationStats, setNotificationStats] = useState({ unread: 0 });

  useEffect(() => {
    setNotificationStats({ unread: 0 });
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/dashboard/head", icon: LayoutDashboard },
    { name: "Users", href: "/dashboard/head/staff", icon: Users },  
    { name: "Pending Approvals", href: "/dashboard/head/pending", icon: CheckCircle },
    { name: "My Agendas", href: "/dashboard/head/agendas", icon: Calendar },
    { name: "Archive", href: "/dashboard/head/archive", icon: Archive },
    { name: "Reports", href: "/dashboard/head/reports", icon: FileText },
    { name: "Notifications", href: "/dashboard/head/notifications", icon: Bell },
  ];

  const handleLogout = () => {
    router.post('/logout');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
          <h1 className="text-xl font-bold text-white">ARU IOCS</h1>
        </div>
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = url === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome{user?.name ? `, ${user.name}` : ""} 👋</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/head/notifications" className="relative text-gray-500 hover:text-gray-700">
                <Bell className="w-6 h-6" />
                {notificationStats.unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationStats.unread > 99 ? '99+' : notificationStats.unread}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'H'}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="font-semibold">{user?.name || 'Head User'}</div>
                      <div className="text-sm text-gray-500">Head</div>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
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

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}