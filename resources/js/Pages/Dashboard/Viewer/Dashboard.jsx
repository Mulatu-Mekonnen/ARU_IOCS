import React from 'react';
import { Link } from '@inertiajs/react';
import ViewerLayout from './ViewerLayout';
import AnnouncementsList from '../../component/Announcements/AnnouncementList';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Forward,
  Inbox
} from "lucide-react";

function StatCard({ title, value, icon: Icon, href, color }) {
  const colorClasses = {
    blue: 'border-blue-200 hover:bg-blue-50',
    green: 'border-green-200 hover:bg-green-50',
    purple: 'border-purple-200 hover:bg-purple-50',
    yellow: 'border-yellow-200 hover:bg-yellow-50',
    red: 'border-red-200 hover:bg-red-50',
    indigo: 'border-indigo-200 hover:bg-indigo-50',
    gray: 'border-gray-200 hover:bg-gray-50',
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    indigo: 'text-indigo-600',
    gray: 'text-gray-600',
  };

  return (
    <Link
      href={href}
      className={`block p-6 bg-white rounded-xl border shadow-sm ${colorClasses[color] || colorClasses.gray} border-l-4 transition-all duration-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${iconColors[color] || iconColors.gray} opacity-75`} />
      </div>
    </Link>
  );
}

export default function Dashboard({ stats, auth, announcements = [], recentActivities = [] }) {
  return (
    <ViewerLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Viewer Dashboard</h1>
          <p className="text-gray-600">Overview of office agendas and communications</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Office Agendas"
            value={stats.totalAgendas || 0}
            icon={Calendar}
            href="/dashboard/viewer/inbox"
            color="purple"
          />
          <StatCard
            title="Pending"
            value={stats.pendingAgendas || 0}
            icon={Clock}
            href="/dashboard/viewer/inbox"
            color="yellow"
          />
          <StatCard
            title="Approved"
            value={stats.approvedAgendas || 0}
            icon={CheckCircle}
            href="/dashboard/viewer/inbox"
            color="green"
          />
          <StatCard
            title="Rejected"
            value={stats.rejectedAgendas || 0}
            icon={XCircle}
            href="/dashboard/viewer/inbox"
            color="red"
          />
          <StatCard
            title="Forwarded"
            value={stats.forwardedAgendas || 0}
            icon={Forward}
            href="/dashboard/viewer/inbox"
            color="indigo"
          />
        </div>

        {/* Quick Links Section */}
        <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl shadow-sm border border-orange-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/dashboard/viewer/inbox"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
            >
              <Inbox className="w-6 h-6 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">View Inbox</p>
                <p className="text-xs text-gray-600">Office communications</p>
              </div>
            </Link>
            <Link
              href="/dashboard/viewer/announcements"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
            >
              <Calendar className="w-6 h-6 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Announcements</p>
                <p className="text-xs text-gray-600">Important updates</p>
              </div>
            </Link>
            <Link
              href="/dashboard/viewer/archive"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
            >
              <Calendar className="w-6 h-6 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Archived Items</p>
                <p className="text-xs text-gray-600">View history</p>
              </div>
            </Link>
          </div>
        </div>
         {/* System Announcements */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">System Announcements</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <AnnouncementsList announcements={announcements} />
        </div>
      </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-gray-900">{activity.title} ({activity.status})</p>
                    <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">By {activity.actor}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent activity yet.</p>
            )}
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">About Your Access</h3>
          <p className="text-blue-800 text-sm">
            As a viewer, you have read-only access to office agendas and communications shared with your office. 
            Use the navigation menu to explore inbox, announcements, and archived items.
          </p>
        </div>
      </div>
    </ViewerLayout>
  );
}