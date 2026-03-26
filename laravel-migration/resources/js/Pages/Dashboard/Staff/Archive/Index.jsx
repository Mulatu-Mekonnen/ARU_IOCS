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

export default function Index({ agendas: initialAgendas, filters }) {
  const [agendas] = useState(initialAgendas.data || initialAgendas);
  const [search, setSearch] = useState(filters?.search || "");
  const [statusFilter, setStatusFilter] = useState(filters?.status || "");
  const [dateFrom, setDateFrom] = useState(filters?.dateFrom || "");
  const [dateTo, setDateTo] = useState(filters?.dateTo || "");

  const filtered = useMemo(() => {
    let result = agendas;

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(query) || 
        (a.description && a.description.toLowerCase().includes(query))
      );
    }

    if (statusFilter) {
      result = result.filter(a => a.status === statusFilter);
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter(a => new Date(a.created_at) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      result = result.filter(a => new Date(a.created_at) <= to);
    }

    return result;
  }, [agendas, search, statusFilter, dateFrom, dateTo]);

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Archive</h1>
            <p className="text-sm text-gray-500">View and filter historical communications.</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title / description"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="FORWARDED">Forwarded</option>
              <option value="ARCHIVED">Archived</option>
              <option value="PENDING">Pending</option>
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setDateFrom("");
                setDateTo("");
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Archive Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Receiver</th>
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
              No archived items found.
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}