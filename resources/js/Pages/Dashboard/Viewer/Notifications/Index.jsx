import React from 'react';
import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import ViewerLayout from '../ViewerLayout';
import { Bell, AlertCircle, CheckCircle, XCircle, ArrowRight, Eye } from 'lucide-react';

export default function Index({ notifications: initialNotifications }) {
  const [notifications, setNotifications] = useState(
    (initialNotifications || []).map((n) => ({ ...n, read: n.read || false }))
  );

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.read).length;
    const highPriority = notifications.filter((n) => n.priority === 'high' && !n.read).length;
    const today = notifications.filter((n) => {
      const notifDate = new Date(n.timestamp);
      const now = new Date();
      return notifDate.toDateString() === now.toDateString();
    }).length;

    return { total, unread, highPriority, today };
  }, [notifications]);

  const getIcon = (type) => {
    switch (type) {
      case 'communication_approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'communication_rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'communication_forwarded':
        return <ArrowRight className="w-5 h-5 text-indigo-600" />;
      case 'new_communication':
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const markAsRead = (id) => {
    router.post('/dashboard/notifications/read', { notification_id: id }, { preserveScroll: true });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    router.post('/dashboard/notifications/read-all', {
      notification_ids: notifications.map((n) => n.id),
    }, { preserveScroll: true });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <ViewerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">Recent office communication updates.</p>
        </div>
        {stats.unread > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Mark all read ({stats.unread})
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card label="Total" value={stats.total} />
          <Card label="Unread" value={stats.unread} />
          <Card label="High priority" value={stats.highPriority} />
          <Card label="Today" value={stats.today} />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              No notifications available.
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 flex items-start gap-3 ${notification.read ? 'bg-white' : 'bg-orange-50/40'}`}
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
                    <a href={notification.actionUrl} className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      View
                    </a>
                    {!notification.read && (
                      <button onClick={() => markAsRead(notification.id)} className="text-sm text-gray-600 hover:text-gray-900">
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
    </ViewerLayout>
  );
}

function Card({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
