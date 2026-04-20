import React from 'react';
import { useState, useMemo } from 'react';
import StaffLayout from '../StaffLayout';
import { Eye } from 'lucide-react';

function getStatusColor(status) {
  switch (status) {
    case 'APPROVED': return 'bg-green-100 text-green-800';
    case 'REJECTED': return 'bg-red-100 text-red-800';
    case 'FORWARDED': return 'bg-blue-100 text-blue-800';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default function Index({ agendas: initialAgendas, filters }) {
  const [agendas] = useState(initialAgendas.data || initialAgendas);
  const [statusFilter, setStatusFilter] = useState(filters?.status || "");
  const [selectedAgenda, setSelectedAgenda] = useState(null);

  const filtered = useMemo(() => {
    if (!statusFilter) return agendas;
    return agendas.filter(a => a.status === statusFilter);
  }, [agendas, statusFilter]);

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Communications</h1>
            <p className="text-gray-600 mt-1">View and manage all your communications</p>
          </div>
          <a
            href="/dashboard/staff/agendas/create"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            + New Communication
          </a>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="FORWARDED">Forwarded</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Communications Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((agenda) => (
                  <tr key={agenda.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{agenda.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {agenda.description ? agenda.description.substring(0, 50) + '...' : '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agenda.status)}`}>
                        {agenda.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(agenda.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedAgenda(agenda)}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              <p>No communications found.</p>
            </div>
          )}
        </div>

        {selectedAgenda && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-gray-200 p-5">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Communication Details</h2>
                  <p className="mt-1 text-sm text-gray-500">View full information for this communication.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAgenda(null)}
                  className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  X
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase text-gray-500">Title</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedAgenda.title}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase text-gray-500">Description</p>
                  <p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
                    {selectedAgenda.description || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Sender Office</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedAgenda.sender_office?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Receiver Office</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedAgenda.receiver_office?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Status</p>
                  <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(selectedAgenda.status)}`}>
                    {selectedAgenda.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Created At</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedAgenda.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end border-t border-gray-200 p-5">
                <button
                  type="button"
                  onClick={() => setSelectedAgenda(null)}
                  className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}