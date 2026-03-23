"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StaffArchiveClient() {
  const [agendas, setAgendas] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadArchive();
  }, [statusFilter, dateFrom, dateTo]);

  async function loadArchive() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ archive: "true", page: "1", pageSize: "200" });
      if (statusFilter) params.set("status", statusFilter);
      if (dateFrom) params.set("startDate", dateFrom);
      if (dateTo) params.set("endDate", dateTo);

      const res = await fetch(`/api/dashboard/staff/agendas?${params.toString()}`, { credentials: "include" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load archive");
      }
      const data = await res.json();
      setAgendas(data.agendas || []);
    } catch (err) {
      setError(err.message || "Failed to load archive");
    } finally {
      setLoading(false);
    }
  }

  const filtered = agendas.filter((agenda) => {
    if (!search.trim()) return true;
    return agenda.title.toLowerCase().includes(search.toLowerCase()) || agenda.description?.toLowerCase().includes(search.toLowerCase());
  });

  function statusBadge(status) {
    const map = {
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
      FORWARDED: "bg-blue-100 text-blue-700",
      ARCHIVED: "bg-gray-100 text-gray-700",
      PENDING: "bg-yellow-100 text-yellow-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Archive</h1>
          <p className="text-sm text-gray-500">View and filter historical communications.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 w-full md:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title / description"
            className="border border-gray-300 rounded p-2"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded p-2">
            <option value="">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="FORWARDED">Forwarded</option>
            <option value="ARCHIVED">Archived</option>
            <option value="PENDING">Pending</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border border-gray-300 rounded p-2" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border border-gray-300 rounded p-2" />
          <button onClick={loadArchive} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Refresh</button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded">{error}</div>}

      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Receiver</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm text-gray-500">No archived items found.</td>
              </tr>
            ) : (
              filtered.map((agenda) => (
                <tr key={agenda.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{agenda.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{agenda.receiverOffice?.name || "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(agenda.status)}`}>{agenda.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">{new Date(agenda.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    <Link href={`/dashboard/staff/detail/${agenda.id}`} className="text-blue-600 hover:text-blue-800">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
