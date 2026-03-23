"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StaffSentClient() {
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadSent();
  }, []);

  async function loadSent() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/dashboard/staff/agendas?sent=true&page=1&pageSize=200', { credentials: 'include' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load sent items');
      }
      const data = await res.json();
      setAgendas(data.agendas || []);
    } catch (err) {
      setError(err.message || 'Failed to load sent items');
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
      PENDING: "bg-yellow-100 text-yellow-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
      FORWARDED: "bg-blue-100 text-blue-700",
      ARCHIVED: "bg-gray-100 text-gray-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sent Communications</h1>
          <p className="text-sm text-gray-500">Communications created by you.</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title / description"
          className="border border-gray-300 rounded p-2 w-64"
        />
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded">{error}</div>}

      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full">
          <thead className="bg-gray-50">
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
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-gray-500">No sent items found.</td>
              </tr>
            ) : (
              filtered.map((agenda) => (
                <tr key={agenda.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{agenda.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{agenda.receiverOffice?.name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{agenda.currentOffice?.name || "-"}</td>
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
