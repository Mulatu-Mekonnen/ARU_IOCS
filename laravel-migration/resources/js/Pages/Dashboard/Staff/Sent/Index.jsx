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
                    <td className="px-4 py-3 text-sm text-gray-800">{agenda.office?.name || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{agenda.office?.name || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(agenda.status)}`}>
                        {agenda.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {new Date(agenda.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <a
                        href={`/dashboard/staff/detail/${agenda.id}`}
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </a>
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
      </div>
    </StaffLayout>
  );
}