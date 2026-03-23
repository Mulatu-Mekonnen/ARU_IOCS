"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Eye, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function StaffDetailClient({ agendaId }) {
  const [agenda, setAgenda] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!agendaId) return;
    loadAgenda();
  }, [agendaId]);

  async function loadAgenda() {
    setLoading(true);
    setError("");
    try {
      const [agendaRes, timelineRes] = await Promise.all([
        fetch(`/api/admin/agendas/${agendaId}`, { credentials: "include" }),
        fetch(`/api/agendas/${agendaId}/timeline`, { credentials: "include" }),
      ]);

      if (!agendaRes.ok) {
        const data = await agendaRes.json();
        throw new Error(data.error || "Failed to load agenda");
      }
      if (!timelineRes.ok) {
        const data = await timelineRes.json();
        throw new Error(data.error || "Failed to load timeline");
      }

      setAgenda(await agendaRes.json());
      setTimeline((await timelineRes.json()).timeline || []);
    } catch (err) {
      setError(err.message || "Failed to load communication details");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Communication Detail</h1>
        <Link href="/dashboard/staff/inbox" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>}
      {!loading && !error && agenda && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">{agenda.title}</h2>
            <p className="text-gray-600 mb-4">{agenda.description || "No description available."}</p>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Sender:</strong> {agenda.createdBy?.name || "-"}</p>
              <p><strong>Sender Office:</strong> {agenda.senderOffice?.name || "-"}</p>
              <p><strong>Receiver Office:</strong> {agenda.receiverOffice?.name || "-"}</p>
              <p><strong>Current Office:</strong> {agenda.currentOffice?.name || "-"}</p>
              <p><strong>Status:</strong> {agenda.status}</p>
              <p><strong>Created At:</strong> {new Date(agenda.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Timeline</h3>
            {timeline.length === 0 ? (
              <p className="text-sm text-gray-500">No timeline events found.</p>
            ) : (
              <ul className="space-y-3">
                {timeline.map((item) => (
                  <li key={item.id} className="border border-gray-200 rounded p-2">
                    <div className="text-sm font-medium text-gray-800">{item.action}</div>
                    <div className="text-xs text-gray-500">{new Date(item.at).toLocaleString()}</div>
                    <div className="text-sm text-gray-600">{item.comment || "(No comment)"}</div>
                    <div className="text-xs text-gray-500">By: {item.by}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
