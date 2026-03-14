"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AgendaManagementClient() {
  const router = useRouter();
  const [agendas, setAgendas] = useState([]);
  const [offices, setOffices] = useState([]);
  const [officeFilter, setOfficeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [forwarding, setForwarding] = useState({ agendaId: null, officeId: "" });
  const [forwardError, setForwardError] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    loadAgendas();
  }, [officeFilter, statusFilter, page]);

  useEffect(() => {
    fetch("/api/admin/offices", { credentials: "include" })
      .then((r) => r.json())
      .then(setOffices)
      .catch((err) => {
        console.error(err);
        setOffices([]);
      });
  }, []);

  async function loadAgendas() {
    setLoadError("");
    const params = new URLSearchParams();
    if (officeFilter) params.set("officeId", officeFilter);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", page);
    params.set("pageSize", 20);

    try {
      const res = await fetch(`/api/admin/agendas?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data?.error || "Failed to load agendas";
        setLoadError(errorMessage);
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
        }
        setAgendas([]);
        setTotal(0);
        return;
      }

      setAgendas(data.agendas || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to load agendas", err);
      setLoadError("Failed to load agendas");
      setAgendas([]);
      setTotal(0);
    }
  }

  async function performAction(id, action, extra = {}) {
    const body = { action, ...extra };
    await fetch(`/api/admin/agendas/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    loadAgendas();
  }

  function openForwardModal(id) {
    setForwardError("");
    setForwarding({ agendaId: id, officeId: "" });
  }

  function closeForwardModal() {
    setForwarding({ agendaId: null, officeId: "" });
    setForwardError("");
  }

  async function submitForward() {
    if (!forwarding.officeId) {
      setForwardError("Choose an office to forward to.");
      return;
    }

    await performAction(forwarding.agendaId, "forward", {
      receiverOfficeId: forwarding.officeId,
    });
    closeForwardModal();
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Agenda Management</h1>

      {loadError && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">
          {loadError}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-4">
        <select
          value={officeFilter}
          onChange={(e) => {
            setOfficeFilter(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded"
        >
          <option value="">All Offices</option>
          {offices.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="FORWARDED">Forwarded</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <table className="w-full border rounded-lg bg-arsiLight shadow">
        <thead className="bg-arsiLight text-left">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Title</th>
            <th className="p-3">Sender</th>
            <th className="p-3">Receiver</th>
            <th className="p-3">Created By</th>
            <th className="p-3">Status</th>
            <th className="p-3">Created At</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(agendas || []).map((agenda) => (
            <tr key={agenda.id} className="border-t">
              <td className="p-3 text-sm">{agenda.id}</td>
              <td className="p-3">{agenda.title}</td>
              <td className="p-3">{agenda.senderOffice?.name || "-"}</td>
              <td className="p-3">{agenda.receiverOffice?.name || "-"}</td>
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
              <td className="p-3 flex flex-wrap gap-2">
                <button
                  onClick={() => alert(JSON.stringify(agenda, null, 2))}
                  className="px-3 py-1 bg-gray-300 rounded"
                >
                  View
                </button>
                {agenda.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => performAction(agenda.id, "approve")}
                      className="px-3 py-1 bg-arsiBlue text-white rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => performAction(agenda.id, "reject")}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => openForwardModal(agenda.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      Forward
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
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
                <label className="block text-sm font-medium text-gray-700">Forward to office</label>
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
    </div>
  );
}
