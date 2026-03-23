"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle, Clock, AlertCircle, XCircle, ArrowRight, Eye } from "lucide-react";

export default function StaffNotificationsClient() {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, highPriority: 0, today: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/staff/notifications", { credentials: "include" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load notifications");
      }
      const data = await res.json();

      const readList = JSON.parse(localStorage.getItem("staff_read_notifications") || "[]");
      const mapped = data.notifications.map((item) => ({ ...item, read: readList.includes(item.id) }));

      setNotifications(mapped);
      setStats(data.stats || { total: 0, unread: mapped.filter((n) => !n.read).length, highPriority: 0, today: 0 });
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  function markAsRead(id) {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    const readList = JSON.parse(localStorage.getItem("staff_read_notifications") || "[]");
    if (!readList.includes(id)) {
      localStorage.setItem("staff_read_notifications", JSON.stringify([...readList, id]));
    }
    setStats((s) => ({ ...s, unread: Math.max(0, s.unread - 1) }));
  }

  function markAllAsRead() {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    const readList = JSON.parse(localStorage.getItem("staff_read_notifications") || "[]");
    localStorage.setItem("staff_read_notifications", JSON.stringify([...new Set([...readList, ...unreadIds])]));
    setStats((prev) => ({ ...prev, unread: 0 }));
  }

  function getIcon(type) {
    switch (type) {
      case "new_communication":
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case "approval_update":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected_communication":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "pending_reminder":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "communication_forwarded":
      case "forwarded_communication":
        return <ArrowRight className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">Important updates about communications and approvals.</p>
        </div>
        <button onClick={markAllAsRead} disabled={stats.unread === 0} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70">
          Mark all read ({stats.unread})
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>}

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

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No notifications available.</div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className={`p-4 border-b border-gray-100 flex items-start gap-3 ${notification.read ? "bg-white" : "bg-blue-50"}`}>
              <div>{getIcon(notification.type)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start gap-3">
                  <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                  <span className="text-xs text-gray-500">{new Date(notification.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <div className="mt-2 flex items-center gap-3">
                  <Link href={notification.actionUrl} className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center gap-1">
                    <Eye className="w-4 h-4" /> View
                  </Link>
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
  );
}
