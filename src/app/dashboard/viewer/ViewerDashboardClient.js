"use client";

import { useEffect, useState } from "react";

export default function ViewerDashboardClient() {
  const [agendas, setAgendas] = useState([]);
  const [officeFilter, setOfficeFilter] = useState("");
  const [offices, setOffices] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState({ type: null, data: null });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };
  const [stats, setStats] = useState({ total: 0 });

  useEffect(() => {
    loadAgendas();
  }, [officeFilter, page]);

  useEffect(() => {
    fetch("/api/admin/offices", { credentials: "include" })
      .then((r) => {
        if (r.ok) return r.json();
        else throw new Error("Failed to fetch offices");
      })
      .then(setOffices)
      .catch(() => setOffices([]));
  }, []);

  async function loadAgendas() {
    const params = new URLSearchParams();
    params.set("status", "APPROVED");
    if (officeFilter) params.set("officeId", officeFilter);
    params.set("page", page);
    params.set("pageSize", 20);

    const res = await fetch(`/api/admin/agendas?${params.toString()}`, {
      credentials: "include",
    });
    const data = await res.json();
    setAgendas(data.agendas);
    setTotal(data.total);
    setStats({ total: data.total });
  }

  function statusBadge(status) {
    const map = {
      PENDING: "bg-yellow-100 text-yellow-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
      FORWARDED: "bg-blue-100 text-blue-700",
      ARCHIVED: "bg-gray-200 text-gray-700",
    };
    return map[status] || map.PENDING;
  }

  async function openModal(type, agendaId) {
    try {
      const res = await fetch(`/api/agendas/${agendaId}/${type}`, { credentials: "include" });
      const data = await res.json();
      setModal({ type, data });
    } catch (err) {
      console.error(err);
    }
  }
  function openPdfPreview(url) {
    setModal({ type: "viewPdf", data: { url } });
  }
  function closeModal() {
    setModal({ type: null, data: null });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Viewer Dashboard</h1>
          <p className="text-gray-600 mt-1">View approved communications from across offices.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-600">Total Approved</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Communications you can view</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-600">Current Filter</p>
          <p className="text-3xl font-bold text-gray-900">{officeFilter ? offices.find((o) => o.id === officeFilter)?.name || "Office" : "All Offices"}</p>
          <p className="text-xs text-gray-500 mt-1">Filtering approved items only</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-600">Pages</p>
          <p className="text-3xl font-bold text-gray-900">{Math.ceil(total / 20) || 1}</p>
          <p className="text-xs text-gray-500 mt-1">Page size: 20</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <p className="text-sm font-medium text-gray-600">Office Count</p>
          <p className="text-3xl font-bold text-gray-900">{offices.length}</p>
          <p className="text-xs text-gray-500 mt-1">Available offices</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter by office:</span>
          <select
            value={officeFilter}
            onChange={(e) => {
              setOfficeFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Offices</option>
            {offices.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing {agendas.length} item{agendas.length === 1 ? "" : "s"}
        </div>
      </div>

      <table className="w-full border rounded-lg bg-arsiLight shadow">
        <thead className="bg-arsiLight text-left">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Title</th>
            <th className="p-3">Sender</th>
            <th className="p-3">Receiver</th>
            <th className="p-3">Current Office</th>
            <th className="p-3">Created By</th>
            <th className="p-3">Status</th>
            <th className="p-3">Created At</th>
            <th className="p-3">Attachment</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {agendas.map((agenda) => {
            const attachmentUrl = agenda.attachmentUrl || agenda.attachment;
            return (
              <tr key={agenda.id} className="border-t">
                <td className="p-3 text-sm">{agenda.id}</td>
                <td className="p-3">{agenda.title}</td>
                <td className="p-3">{agenda.senderOffice?.name || "-"}</td>
                <td className="p-3">{agenda.receiverOffice?.name || "-"}</td>
                <td className="p-3">{agenda.currentOffice?.name || "-"}</td>
                <td className="p-3">{agenda.createdBy?.name}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${statusBadge(
                      agenda.status
                    )}`}
                  >
                    {agenda.status}
                  </span>
                </td>
                <td className="p-3">{new Date(agenda.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  {attachmentUrl ? (
                    <div className="space-x-2">
                      <a
                        href={attachmentUrl}
                        className="text-arsiBlue underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                      {attachmentUrl.toLowerCase().endsWith('.pdf') && (
                        <button
                          onClick={() => openPdfPreview(attachmentUrl)}
                          className="text-arsiBlue underline"
                        >
                          Preview
                        </button>
                      )}
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => openModal("timeline", agenda.id)}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    Timeline
                  </button>
                  <button
                    onClick={() => openModal("routing", agenda.id)}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    Routing
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {total > agendas.length && (
        <div className="mt-4 flex justify-between">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            disabled={page * 20 >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {modal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg font-semibold">
                {modal.type === "timeline"
                  ? "Agenda Timeline"
                  : modal.type === "routing"
                  ? "Routing History"
                  : "PDF Preview"}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-800">
                Close
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {modal.type === "timeline" && (
                <ul className="space-y-3">
                  {modal.data?.timeline?.length ? (
                    modal.data.timeline.map((item) => (
                      <li key={item.id} className="border rounded p-3">
                        <div className="text-sm text-gray-600">
                          {new Date(item.at).toLocaleString()}
                        </div>
                        <div className="font-semibold">{item.action}</div>
                        <div className="text-sm text-gray-700">By: {item.by}</div>
                        {item.comment && <div className="text-sm text-gray-600">{item.comment}</div>}
                      </li>
                    ))
                  ) : (
                    <div className="text-gray-600">No timeline entries found.</div>
                  )}
                </ul>
              )}

              {modal.type === "routing" && (
                <ul className="space-y-3">
                  {modal.data?.routing?.length ? (
                    modal.data.routing.map((item) => (
                      <li key={item.id} className="border rounded p-3">
                        <div className="text-sm text-gray-600">
                          {new Date(item.at).toLocaleString()}
                        </div>
                        <div className="font-semibold">
                          {item.from} → {item.to}
                        </div>
                        <div className="text-sm text-gray-700">Routed by: {item.by}</div>
                      </li>
                    ))
                  ) : (
                    <div className="text-gray-600">No routing data found.</div>
                  )}
                </ul>
              )}

              {modal.type === "viewPdf" && (
                <div className="h-[60vh]">
                  <iframe
                    src={modal.data?.url}
                    className="w-full h-full border"
                    title="PDF preview"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}