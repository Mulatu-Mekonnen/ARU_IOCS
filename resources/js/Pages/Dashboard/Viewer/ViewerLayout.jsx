import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X
} from "lucide-react";

export default function ViewerLayout({ children }) {
  const { url, props } = usePage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState(props.auth?.user || null);
  const [notificationStats, setNotificationStats] = useState({ unread: 0 });

  useEffect(() => {
    setNotificationStats({ unread: 0 });
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/dashboard/viewer", icon: LayoutDashboard },
    { name: "Inbox", href: "/dashboard/viewer/inbox", icon: Bell },
    { name: "Announcements", href: "/dashboard/viewer/announcements", icon: Calendar },
    { name: "Notifications", href: "/dashboard/viewer/notifications", icon: Bell },
    { name: "Archive", href: "/dashboard/viewer/archive", icon: Calendar },
  ];

  const handleLogout = () => {
    router.post('/logout');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-16 px-4 bg-orange-600">
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
                      ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-700'
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
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4 ml-auto">
              {/* Notifications */}
              <Link href="/dashboard/viewer/notifications" className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative">
                <Bell className="w-5 h-5" />
                {notificationStats.unread > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {notificationStats.unread}
                  </span>
                )}
              </Link>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium">{user?.name || 'User'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
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