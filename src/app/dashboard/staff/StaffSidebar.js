"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Inbox, Send, Archive, Bell } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard/staff", icon: Home },
  { name: "Create", href: "/dashboard/staff/create", icon: PlusCircle },
  { name: "Inbox", href: "/dashboard/staff/inbox", icon: Inbox },
  { name: "Sent", href: "/dashboard/staff/sent", icon: Send },
  { name: "Archive", href: "/dashboard/staff/archive", icon: Archive },
  { name: "Notifications", href: "/dashboard/staff/notifications", icon: Bell },
];

export default function StaffSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full p-4 space-y-2 bg-white border-r border-gray-200">
      <div className="px-2 py-3 text-lg font-semibold text-slate-700">Staff Menu</div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                active ? "bg-blue-100 text-blue-800" : "text-slate-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
