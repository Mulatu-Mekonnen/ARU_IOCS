import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Building,
  Megaphone,
  FileText,
  Shield,
  Settings,
  Menu,
  X,
  Bell,
  User,
  LogOut,
  ChevronDown
} from "lucide-react";

export default function AdminLayout({ children }) {
  const { url, props } = usePage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState(props.auth?.user || null);
  const [notificationStats, setNotificationStats] = useState({ unread: 0 });

  useEffect(() => {
    // Fetch notification stats if needed
    setNotificationStats({ unread: 0 });
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Users", href: "/dashboard/admin/users", icon: Users },
    { name: "Agendas", href: "/dashboard/admin/agendas", icon: Calendar },
    { name: "Offices", href: "/dashboard/admin/offices", icon: Building },
    { name: "Announcements", href: "/dashboard/admin/announcements", icon: Megaphone },
    { name: "Reports", href: "/dashboard/admin/reports", icon: FileText },
    { name: "Audit Logs", href: "/dashboard/admin/audit-logs", icon: Shield },
    { name: "Notifications", href: "/dashboard/admin/notifications", icon: Bell },
    { name: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ];

  const handleLogout = () => {
    // Inertia post to logout
    window.location.href = '/logout';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static md:inset-0`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-yellow-500">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  url === item.href
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">Arsi University System</div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
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
              <Link href="/dashboard/admin/notifications" className="relative text-gray-500 hover:text-gray-700">
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
                    A
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="font-semibold">{user?.name || 'Admin User'}</div>
                      <div className="text-sm text-gray-500">Administrator</div>
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

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}