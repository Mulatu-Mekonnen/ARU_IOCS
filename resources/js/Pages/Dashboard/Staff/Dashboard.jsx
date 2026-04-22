import React from 'react';
import { Link } from '@inertiajs/react';
import StaffLayout from './StaffLayout';
import AnnouncementsList from '../../component/Announcements/AnnouncementList';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ForwardIcon,
  Plus
} from "lucide-react";

function StatCard({ title, value, icon: Icon, href, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <Link
      href={href}
      className={`block p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow ${colorClasses[color] || colorClasses.gray}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-75" />
      </div>
    </Link>
  );
}

function QuickActionButton({ title, icon: Icon, color, href, action }) {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
  };

  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center p-4 rounded-lg text-white transition-colors ${colorClasses[color] || colorClasses.blue}`}
    >
      <Icon className="w-6 h-6 mb-2" />
      <span className="text-sm font-medium text-center">{title}</span>
      <span className="text-xs opacity-75">{action}</span>
    </Link>
  );
}

export default function Dashboard({ stats, auth, announcements = [], recentActivities = [] }) {
  return (
    <StaffLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
          <p className="text-gray-600">View and manage your agendas</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <StatCard
            title="My Agendas"
            value={stats.totalAgendas || 0}
            icon={Calendar}
            href="/dashboard/staff/agendas"
            color="purple"
          />
          <StatCard
            title="Pending"
            value={stats.pendingAgendas || 0}
            icon={Clock}
            href="/dashboard/staff/agendas?status=pending"
            color="yellow"
          />
          <StatCard
            title="Approved"
            value={stats.approvedAgendas || 0}
            icon={CheckCircle}
            href="/dashboard/staff/agendas?status=approved"
            color="green"
          />
          <StatCard
            title="Rejected"
            value={stats.rejectedAgendas || 0}
            icon={XCircle}
            href="/dashboard/staff/agendas?status=rejected"
            color="red"
          />
          <StatCard
            title="Forwarded"
            value={stats.forwardedAgendas || 0}
            icon={ForwardIcon}
            href="/dashboard/staff/agendas?status=forwarded"
            color="gray"
          />
        </div>

        {/* Quick Access Actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <QuickActionButton
              title="New Agenda"
              icon={Plus}
              color="purple"
              href="/dashboard/staff/agendas/create"
              action="create"
            />
            <QuickActionButton
              title="View Agendas"
              icon={Calendar}
              color="blue"
              href="/dashboard/staff/agendas"
              action="view"
            />
          </div>
        </div>
         {/* System Announcements */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">System Announcements</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <AnnouncementsList announcements={announcements} />
        </div>
      </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}