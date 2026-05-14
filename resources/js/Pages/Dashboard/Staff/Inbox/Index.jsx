import React from 'react';
import { useState, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import StaffLayout from '../StaffLayout';
import { Search, Eye, Check, X } from 'lucide-react';

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

export default function Index({ agendas: initialAgendas, myOfficeId }) {
  const page = usePage();
  const flash = page.props.flash || {};
  const validationErrors = page.props.errors || {};
  const [agendas] = useState(initialAgendas.data || initialAgendas);
  const [search, setSearch] = useState("");
  const [selectedAgenda, setSelectedAgenda] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, agendaId: null, reason: "" });
  const [submittingId, setSubmittingId] = useState(null);

  const canRespond = (agenda) =>
    agenda.status === "PENDING" &&
    myOfficeId != null &&
    String(agenda.current_office_id) === String(myOfficeId);

  const submitApprove = (agendaId) => {
    if (submittingId) return;
    setSubmittingId(agendaId);
    router.patch(`/dashboard/staff/inbox/${agendaId}`, { action: "approve" }, {
      preserveScroll: true,
      onFinish: () => setSubmittingId(null),
    });
  };

  const openReject = (agendaId) => {
    setRejectModal({ open: true, agendaId, reason: "" });
  };

  const submitReject = () => {
    if (!rejectModal.agendaId || !rejectModal.reason.trim() || submittingId) return;
    setSubmittingId(rejectModal.agendaId);
    router.patch(
      `/dashboard/staff/inbox/${rejectModal.agendaId}`,
      { action: "reject", comment: rejectModal.reason.trim() },
      {
        preserveScroll: true,
        onSuccess: () => {
          setRejectModal({ open: false, agendaId: null, reason: "" });
          setSelectedAgenda(null);
        },
        onFinish: () => setSubmittingId(null),
      }
    );
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
            <p className="text-sm text-gray-500">
              Communications sent to your office. Pending items can be accepted or rejected here — no admin step.
            </p>
          </div>
        </div>

        {(validationErrors.comment || validationErrors.action) && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {validationErrors.comment || validationErrors.action}
          </div>
        )}
        {(flash.success || flash.error) && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              flash.error ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"
            }`}
          >
            {flash.error || flash.success}
          </div>
        )}

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

        {/* Inbox Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sender</th>
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
                    <td className="px-4 py-3 text-sm text-gray-800">{agenda.created_by?.name || "Unknown"}</td>
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
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedAgenda(agenda)}
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        {canRespond(agenda) && (
                          <>
                            <button
                              type="button"
                              disabled={submittingId === agenda.id}
                              onClick={() => submitApprove(agenda.id)}
                              className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Accept
                            </button>
                            <button
                              type="button"
                              disabled={submittingId === agenda.id}
                              onClick={() => openReject(agenda.id)}
                              className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-gray-500">
              No messages found.
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
                  <p className="text-xs font-semibold uppercase text-gray-500">Sender</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedAgenda.created_by?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Receiver Office</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedAgenda.receiver_office?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Current Office (action)</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedAgenda.current_office?.name || "-"}</p>
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

              <div className="flex flex-wrap justify-end gap-2 border-t border-gray-200 p-5">
                {selectedAgenda && canRespond(selectedAgenda) && (
                  <>
                    <button
                      type="button"
                      disabled={submittingId === selectedAgenda.id}
                      onClick={() => submitApprove(selectedAgenda.id)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={submittingId === selectedAgenda.id}
                      onClick={() => {
                        openReject(selectedAgenda.id);
                      }}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
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

      {rejectModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Reject communication</h3>
            <p className="mt-1 text-sm text-gray-600">A reason is required.</p>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((m) => ({ ...m, reason: e.target.value }))}
              className="mt-4 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              rows={4}
              placeholder="Reason for rejection..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModal({ open: false, agendaId: null, reason: "" })}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectModal.reason.trim() || submittingId}
                onClick={submitReject}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Submit rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}