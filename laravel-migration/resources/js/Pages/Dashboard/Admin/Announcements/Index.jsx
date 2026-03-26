import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Plus, X, Send, BellRing, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function Index({ announcements }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [currentPage, setCurrentPage] = useState(announcements.current_page);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    title: "",
    body: "",
  });

  const handleEdit = (announcement) => {
    setEditing(announcement);
    setData({
      title: announcement.title,
      body: announcement.body,
    });
    setShowForm(true);
  };

  const handleDelete = (announcement) => {
    if (confirm(`Delete "${announcement.title}"?`)) {
      router.delete(`/dashboard/admin/announcements/${announcement.id}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      put(`/dashboard/admin/announcements/${editing.id}`, {
        onSuccess: () => {
          setEditing(null);
          setShowForm(false);
          reset();
        },
      });
    } else {
      post('/dashboard/admin/announcements', {
        onSuccess: () => {
          setShowForm(false);
          reset();
        },
      });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    router.get('/dashboard/admin/announcements', { page });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Post system-wide announcements for the university community.</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <BellRing className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-gray-800">Total announcements</div>
              <div className="text-2xl font-bold text-gray-900">{announcements.total}</div>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
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
                {announcements.data.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{a.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{a.body}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{a.user?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(a)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(a)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          className="inline-flex items-center gap-2 text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                          title="Send"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {announcements.data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No announcements yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {announcements.last_page > 1 && (
            <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {announcements.from} to {announcements.to} of {announcements.total} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {announcements.last_page}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === announcements.last_page}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
              <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editing ? "Edit Announcement" : "New Announcement"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                    reset();
                  }}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={data.body}
                    onChange={(e) => setData('body', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {errors.body && <p className="text-red-500 text-xs mt-1">{errors.body}</p>}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditing(null);
                      reset();
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {editing ? "Update" : "Publish"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}