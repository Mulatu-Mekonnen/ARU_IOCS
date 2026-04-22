import React from 'react';
import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import StaffLayout from '../StaffLayout';
import { Bell, CheckCircle, Clock, AlertCircle, XCircle, ArrowRight, Eye } from 'lucide-react';

export default function Index({ notifications: initialNotifications, stats: initialStats }) {
  const [notifications, setNotifications] = useState(initialNotifications.map(n => ({
    ...n,
    read: n.read || false
  })));

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const highPriority = notifications.filter(n => n.priority === 'high' && !n.read).length;
    const today = notifications.filter(n => {
      const notifDate = new Date(n.timestamp);
      const todayDate = new Date();
      return notifDate.toDateString() === todayDate.toDateString();
    }).length;
    return { total, unread, highPriority, today };
  }, [notifications]);

  function getIcon(type) {
    switch (type) {
      case 'new_communication':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'approval_update':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected_communication':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending_reminder':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'communication_forwarded':
      case 'forwarded_communication':
        return <ArrowRight className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  }

  function markAsRead(id) {
    router.post('/dashboard/notifications/read', { notification_id: id }, { preserveScroll: true });
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }

  function markAllAsRead() {
    router.post('/dashboard/notifications/read-all', {
      notification_ids: notifications.map((n) => n.id),
    }, { preserveScroll: true });
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  }

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">Important updates about communications and approvals.</p>
          </div>
          <button
            onClick={markAllAsRead}
            disabled={stats.unread === 0}
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70 transition"
          >
            Mark all read ({stats.unread})
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500">Total</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500">Unread</p>
            <p className="mt-2 text-2xl font-semibold text-blue-600">{stats.unread}</p>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500">High</p>
            <p className="mt-2 text-2xl font-semibold text-red-600">{stats.highPriority}</p>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500">Today</p>
            <p className="mt-2 text-2xl font-semibold text-green-600">{stats.today}</p>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No notifications available.</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 flex items-start gap-3 ${notification.read ? "bg-white" : "bg-blue-50"}`}
              >
                <div className="flex-shrink-0">{getIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-3">
                    <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <a
                      href={notification.actionUrl}
                      className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </a>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </StaffLayout>
  );
}