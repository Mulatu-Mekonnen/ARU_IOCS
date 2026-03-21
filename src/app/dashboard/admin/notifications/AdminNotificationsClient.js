"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ArrowRight,
  Eye,
  CheckCheck,
  UserPlus,
  Building,
  FileText,
  Megaphone
} from "lucide-react";

export default function AdminNotificationsClient({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, highPriority: 0, today: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch('/api/admin/notifications');
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      
      // Load read status from localStorage
      const readNotifications = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]');
      
      // Mark notifications as read based on localStorage
      const notificationsWithReadStatus = data.notifications.map(notification => ({
        ...notification,
        read: readNotifications.includes(notification.id)
      }));
      
      setNotifications(notificationsWithReadStatus);
      
      // Recalculate stats based on read status
      const totalNotifications = notificationsWithReadStatus.length;
      const unreadCount = notificationsWithReadStatus.filter(n => !n.read).length;
      const highPriorityCount = notificationsWithReadStatus.filter(n => n.priority === 'high' && !n.read).length;
      const todayCount = notificationsWithReadStatus.filter(n => {
        const today = new Date();
        const notifDate = new Date(n.timestamp);
        return notifDate.toDateString() === today.toDateString();
      }).length;
      
      setStats({
        total: totalNotifications,
        unread: unreadCount,
        highPriority: highPriorityCount,
        today: todayCount,
      });
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  function getNotificationIcon(type) {
    switch (type) {
      case 'new_agenda':
      case 'agenda_approved':
      case 'agenda_rejected':
      case 'agenda_forwarded':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'new_user':
        return <UserPlus className="w-5 h-5 text-green-600" />;
      case 'new_office':
        return <Building className="w-5 h-5 text-purple-600" />;
      case 'new_announcement':
        return <Megaphone className="w-5 h-5 text-orange-600" />;
      case 'pending_reminder':
        return <Clock className="w-5 h-5 text-yellow-600" />;
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

  function getTypeLabel(type) {
    switch (type) {
      case 'new_agenda': return 'New Communication';
      case 'agenda_approved': return 'Approved';
      case 'agenda_rejected': return 'Rejected';
      case 'agenda_forwarded': return 'Forwarded';
      case 'new_user': return 'New User';
      case 'new_office': return 'New Office';
      case 'new_announcement': return 'Announcement';
      default: return 'System';
    }
  }

  function markAsRead(id) {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    
    // Persist to localStorage
    const readNotifications = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]');
    if (!readNotifications.includes(id)) {
      readNotifications.push(id);
      localStorage.setItem('admin_read_notifications', JSON.stringify(readNotifications));
    }
    
    // Update stats
    setStats(prev => ({
      ...prev,
      unread: Math.max(0, prev.unread - 1),
      highPriority: prev.highPriority > 0 ? prev.highPriority - 1 : 0
    }));
  }

  function markAllAsRead() {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    
    // Persist to localStorage
    const readNotifications = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]');
    const newReadNotifications = [...new Set([...readNotifications, ...unreadIds])];
    localStorage.setItem('admin_read_notifications', JSON.stringify(newReadNotifications));
    
    setStats(prev => ({
      ...prev,
      unread: 0,
      highPriority: 0
    }));
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Notifications</h1>
            <p className="text-gray-600 mt-2">Monitor system activities, user registrations, and communication workflows.</p>
          </div>
          {stats.unread > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read ({stats.unread})
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
          <h2 className="text-xl font-semibold text-gray-900">Recent System Activities</h2>
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
                      <div className="flex items-center gap-3">
                        <h3 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {getTypeLabel(notification.type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    {notification.metadata?.comment && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        Comment: {notification.metadata.comment}
                      </p>
                    )}
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
              <p className="text-sm mt-2">System activities will appear here as they occur.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}