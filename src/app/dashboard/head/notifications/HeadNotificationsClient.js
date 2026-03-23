"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle, Clock, AlertCircle, XCircle, ArrowRight, Eye, CheckCheck } from "lucide-react";

export default function HeadNotificationsClient({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, highPriority: 0, today: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Mock notifications data - in a real app, this would come from an API
  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch('/api/dashboard/head/notifications', {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to load notifications (${response.status})`);
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setStats(data.stats || { total: 0, unread: 0, highPriority: 0, today: 0 });
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  function getNotificationIcon(type) {
    switch (type) {
      case 'new_communication':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'communication_created':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'approval_update':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending_reminder':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'forwarded_communication':
      case 'communication_forwarded':
        return <ArrowRight className="w-5 h-5 text-purple-600" />;
      case 'rejected_communication':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-gray-500';
      default: return 'border-l-blue-500';
    }
  }

  function markAsRead(id) {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }

  function markAllAsRead() {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  }

  const unreadCount = stats.unread;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">Stay updated with communication activities and approvals.</p>
          </div>
          {stats.unread > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
          )}
        </div>
        {error && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Bell className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-green-600">{stats.today}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Notifications</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                Loading notifications...
              </div>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.read ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {notification.timestamp.toLocaleString()}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <Link
                        href={notification.actionUrl}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications to display.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}