"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Clock,
  Archive,
  BarChart3,
  Bell,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard/head', icon: LayoutDashboard },
  { name: 'Pending Approvals', href: '/dashboard/head/pending', icon: Clock },
  { name: 'Reports', href: '/dashboard/head/reports', icon: BarChart3 },
  { name: 'Archive', href: '/dashboard/head/archive', icon: Archive },
  { name: 'Notifications', href: '/dashboard/head/notifications', icon: Bell },
];

export default function HeadSidebar({ user }) {
  const pathname = usePathname();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);

  // Mock notification count - in real app, fetch from API
  useEffect(() => {
    // Simulate fetching pending count
    fetch('/api/admin/agendas?status=PENDING&page=1&pageSize=1', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setNotifications(data.total || 0))
      .catch(() => setNotifications(0));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="w-64 bg-gray-50 shadow-lg border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <User className="w-8 h-8 text-gray-500" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Head Panel</h2>

          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      
    </div>
  );
}