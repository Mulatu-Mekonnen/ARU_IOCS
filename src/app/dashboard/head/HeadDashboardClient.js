"use client";

import { useEffect, useState } from "react";

export default function HeadDashboardClient({ user }) {
  const [agendas, setAgendas] = useState([]);
  const [offices, setOffices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, forwarded: 0 });

  const [modal, setModal] = useState({ type: null, data: null });
  const [forwarding, setForwarding] = useState({ agendaId: null, officeId: "" });
  const [forwardError, setForwardError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  useEffect(() => {
    loadAgendas();
  }, [statusFilter, page]);

  useEffect(() => {
    setStats({
      pending: agendas.filter((a) => a.status === "PENDING").length,
      approved: agendas.filter((a) => a.status === "APPROVED").length,
      rejected: agendas.filter((a) => a.status === "REJECTED").length,
      forwarded: agendas.filter((a) => a.status === "FORWARDED").length,
    });
  }, [agendas]);

  async function openModal(type, agendaId) {
    try {
      const res = await fetch(`/api/agendas/${agendaId}/${type}`, { credentials: "include" });
      const data = await res.json();
      setModal({ type, data });
    } catch (err) {
      console.error(err);
    }
  }

  function closeModal() {
    setModal({ type: null, data: null });
  }

  useEffect(() => {
    fetch("/api/admin/offices", { credentials: "include" })
      .then((r) => r.json())
      .then(setOffices)
      .catch(console.error);

    // load staff in office for head
    fetch("/api/admin/users", { credentials: "include" })
      .then((r) => r.json())
      .then((u) => setStaff(u))
      .catch(console.error);
  }, []);

  async function loadAgendas() {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", page);
    params.set("pageSize", 20);

    const res = await fetch(`/api/admin/agendas?${params.toString()}`, {
      credentials: "include",
    });
    const data = await res.json();
    setAgendas(data.agendas);
    setTotal(data.total);
  }

  function openPdfPreview(url) {
    setModal({ type: "viewPdf", data: { url } });
  }

  function openForwardModal(agendaId) {
    setForwarding({ agendaId, officeId: "" });
    setForwardError("");
  }

  function closeForwardModal() {
    setForwarding({ agendaId: null, officeId: "" });
    setForwardError("");
  }

  async function submitForward() {
    if (!forwarding.officeId) {
      setForwardError("Select an office to forward to.");
      return;
    }

    await performAction(forwarding.agendaId, "forward", {
      receiverOfficeId: forwarding.officeId,
    });
    closeForwardModal();
  }

  async function performAction(id, action, extra = {}) {
    setActionError("");
    setActionLoadingId(id);

    const body = { action, ...extra };
    const res = await fetch(`/api/admin/agendas/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) {
      setActionError(json.error || "Action failed");
    } else {
      // If we forwarded, close the modal
      if (action === "forward") {
        closeForwardModal();
      }
      await loadAgendas();
    }

    setActionLoadingId(null);
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

  const sortedAgendas = [...agendas].sort((a, b) => {
    const order = { PENDING: 0, FORWARDED: 1, APPROVED: 2, REJECTED: 3, ARCHIVED: 4 };
    return (order[a.status] ?? 10) - (order[b.status] ?? 10);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome{user?.name ? `, ${user.name}` : ""} 👋
          </h1>
          <p className="text-gray-600 mt-1">You have {stats.pending} approval task{stats.pending === 1 ? "" : "s"} waiting.</p>
          {actionError && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              <span className="font-semibold">Error:</span> {actionError}
            </div>
          )}
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
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-xs text-gray-500 mt-1">Items needing your decision</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-600">Forwarded</p>
          <p className="text-3xl font-bold text-gray-900">{stats.forwarded}</p>
          <p className="text-xs text-gray-500 mt-1">Communications you’ve routed</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-600">Approved</p>
          <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
          <p className="text-xs text-gray-500 mt-1">Completed approvals</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <p className="text-sm font-medium text-gray-600">Rejected</p>
          <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
          <p className="text-xs text-gray-500 mt-1">Rejected communications</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="FORWARDED">Forwarded</option>
            <option value="ARCHIVED">Archived</option>
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
          {sortedAgendas.map((agenda) => {
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
                  {agenda.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => performAction(agenda.id, "approve")}
                        disabled={actionLoadingId === agenda.id}
                        className="px-3 py-1 bg-arsiBlue text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => performAction(agenda.id, "reject")}
                        disabled={actionLoadingId === agenda.id}
                        className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => openForwardModal(agenda.id)}
                        disabled={actionLoadingId === agenda.id}
                        className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Forward
                      </button>
                    </>
                  )}
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

      {forwarding.agendaId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg font-semibold">Forward Agenda</h2>
              <button onClick={closeForwardModal} className="text-gray-500 hover:text-gray-800">
                Close
              </button>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">Forward to Office</label>
                <select
                  value={forwarding.officeId}
                  onChange={(e) => setForwarding((f) => ({ ...f, officeId: e.target.value }))}
                  className="mt-2 w-full border rounded px-3 py-2"
                >
                  <option value="">Select office</option>
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
              {forwardError && <div className="text-sm text-red-600 mb-3">{forwardError}</div>}
              <div className="flex justify-end gap-2">
                <button onClick={closeForwardModal} className="px-4 py-2 bg-gray-200 rounded">
                  Cancel
                </button>
                <button onClick={submitForward} className="px-4 py-2 bg-blue-500 text-white rounded">
                  Forward
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* office staff section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Staff in Your Office</h2>
        <table className="w-full border rounded-lg bg-arsiLight shadow">
          <thead className="bg-arsiLight text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.active ? "Active" : "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}