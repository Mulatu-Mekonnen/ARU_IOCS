"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Megaphone,
  FileText,
  Settings
} from "lucide-react";

export default function AdminDashboardClient() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/admin/dashboard", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`API Error: ${res.status} ${errText}`);
        }
        return res.json();
      })
      .then(setData)
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setData({ statusGroups: [], officeGroups: [] });
        if (err.message.includes("401") || err.message.includes("403")) {
          router.push("/login");
        }
      });

    // Fetch user data
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => res.json())
      .then((userData) => setUser(userData))
      .catch((err) => console.error("Failed to fetch user:", err));
  }, [router]);

  if (!data) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Overview</h1>
        <p className="text-gray-600">Monitor and manage your university system</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={data.totalUsers || 0}
          icon={Users}
          href="/dashboard/admin/users"
          color="blue"
        />
        <StatCard
          title="Total Offices"
          value={data.totalOffices || 0}
          icon={Building}
          href="/dashboard/admin/offices"
          color="green"
        />
        <StatCard
          title="Total Agendas"
          value={data.totalAgendas || 0}
          icon={Calendar}
          href="/dashboard/admin/agendas"
          color="purple"
        />
        <StatCard
          title="Pending"
          value={data.pendingAgendas || 0}
          icon={Clock}
          href="/dashboard/admin/agendas?status=pending"
          color="yellow"
        />
        <StatCard
          title="Approved"
          value={data.approvedAgendas || 0}
          icon={CheckCircle}
          href="/dashboard/admin/agendas?status=approved"
          color="green"
        />
        <StatCard
          title="Rejected"
          value={data.rejectedAgendas || 0}
          icon={XCircle}
          href="/dashboard/admin/agendas?status=rejected"
          color="red"
        />
      </div>

      {/* Quick Access Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <QuickActionButton
            title="Add User"
            icon={Users}
            color="blue"
            href="/dashboard/admin/users"
            action="add"
          />
          <QuickActionButton
            title="Add Office"
            icon={Building}
            color="green"
            href="/dashboard/admin/offices"
            action="add"
          />
          <QuickActionButton
            title="View Agendas"
            icon={Calendar}
            color="purple"
            href="/dashboard/admin/agendas"
            action="view"
          />
          <QuickActionButton
            title="New Announcement"
            icon={Megaphone}
            color="orange"
            href="/dashboard/admin/announcements"
            action="add"
          />
          <QuickActionButton
            title="View Reports"
            icon={FileText}
            color="indigo"
            href="/dashboard/admin/reports"
            action="view"
          />
          <QuickActionButton
            title="System Settings"
            icon={Settings}
            color="gray"
            href="/dashboard/admin/settings"
            action="manage"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Agendas by Status</h2>
          <div className="space-y-4">
            {(data.statusGroups || []).map((g) => (
              <div key={g.status} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    g.status === 'PENDING' ? 'bg-yellow-400' :
                    g.status === 'APPROVED' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className="font-medium text-gray-900 capitalize">
                    {g.status.toLowerCase()}
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-700">
                  {g._count.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Agendas by Office</h2>
          <div className="space-y-4">
            {(data.officeGroups || []).map((g) => (
              <div key={g.senderOfficeId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">{g.name}</span>
                <span className="text-lg font-semibold text-gray-700">
                  {g._count.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    green: "bg-green-50 border-green-200 text-green-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-600",
    red: "bg-red-50 border-red-200 text-red-600",
  };

  return (
    <div className={`rounded-xl border shadow-sm p-6 hover:shadow-md transition-all duration-200 cursor-pointer ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color].split(' ')[0]} bg-opacity-20`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ title, icon: Icon, color, href, action }) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100",
    green: "bg-green-50 border-green-200 text-green-600 hover:bg-green-100",
    purple: "bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100",
    orange: "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100",
    gray: "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100",
  };

  const getHref = () => {
    if (action === "add") {
      return `${href}?action=add`;
    }
    return href;
  };

  return (
    <Link href={getHref()}>
      <div className={`flex flex-col items-center justify-center p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${colorClasses[color]}`}>
        <Icon className="w-6 h-6 mb-2" />
        <span className="text-sm font-medium text-center">{title}</span>
      </div>
    </Link>
  );
}