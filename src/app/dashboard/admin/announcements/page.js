"use client";

import { useEffect, useState } from "react";
import { Plus, X, Send, BellRing } from "lucide-react";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/announcements")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAnnouncements(data);
        } else {
          setError(data?.error || "Unexpected response");
        }
      })
      .catch((err) => setError(err.message || "Failed to load announcements"))
      .finally(() => setLoading(false));
  }, []);

  const submitAnnouncement = async (e) => {
    e.preventDefault();
    const body = { title: form.title, body: form.body };
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const created = await res.json();
    if (!res.ok) {
      setError(created?.error || "Failed to create announcement");
      return;
    }
    setAnnouncements((prev) => [created, ...prev]);
    setForm({ title: "", body: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-600 mt-1">Post system-wide announcements for the university community.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-600">
          Loading announcements...
        </div>
      ) : (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <BellRing className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-gray-800">Total announcements</div>
              <div className="text-2xl font-bold text-gray-900">{announcements.length}</div>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 ">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {announcements.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{a.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-2">{a.body}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{a.author}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No announcements yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">New Announcement</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-50 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitAnnouncement} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
