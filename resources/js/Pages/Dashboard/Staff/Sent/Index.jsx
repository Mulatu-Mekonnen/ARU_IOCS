import React from 'react';
import { useState, useMemo } from 'react';
import StaffLayout from '../StaffLayout';
import { Search, Eye } from 'lucide-react';

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

export default function Index({ agendas: initialAgendas }) {
  const [agendas] = useState(initialAgendas.data || initialAgendas);
  const [search, setSearch] = useState("");
  const [selectedAgenda, setSelectedAgenda] = useState(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return agendas;
    const query = search.toLowerCase();
    return agendas.filter(a => 
      a.title.toLowerCase().includes(query) || 
      (a.description && a.description.toLowerCase().includes(query))
    );
  }, [agendas, search]);

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sent Communications</h1>
            <p className="text-sm text-gray-500">Communications created by you.</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title / description"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Sent Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Receiver</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Office</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((agenda) => (
                  <tr key={agenda.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{agenda.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{agenda.receiver_office?.name || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{agenda.sender_office?.name || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(agenda.status)}`}>
                        {agenda.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {new Date(agenda.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <button
                        type="button"
                        onClick={() => setSelectedAgenda(agenda)}
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
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
            <div className="px-6 py-8 text-center text-sm text-gray-500">
              No sent items found.
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