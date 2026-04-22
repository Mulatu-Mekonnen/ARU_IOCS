import React from 'react';
import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import HeadLayout from '../HeadLayout';
import { Eye, Check, X, ArrowRight } from 'lucide-react';

export default function Index({ agendas: initialAgendas, offices }) {
  const [agendas, setAgendas] = useState(initialAgendas.data || initialAgendas);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [reviewModal, setReviewModal] = useState({ type: null, agendaId: null, officeId: "", comment: "" });
  const [selectedAgenda, setSelectedAgenda] = useState(null);

  function openReviewModal(type, agendaId) {
    setReviewModal({ type, agendaId, officeId: "", comment: "" });
    setActionError("");
  }

  function closeReviewModal() {
    setReviewModal({ type: null, agendaId: null, officeId: "", comment: "" });
  }

  async function submitReview() {
    if (!reviewModal.agendaId || !reviewModal.type) return;

    setActionLoadingId(reviewModal.agendaId);
    setActionError("");

    if (reviewModal.type === "forward" && !reviewModal.officeId) {
      setActionError("Please select an office to forward to.");
      setActionLoadingId(null);
      return;
    }
    if (reviewModal.type === "reject" && !reviewModal.comment.trim()) {
      setActionError("Reject reason is required.");
      setActionLoadingId(null);
      return;
    }

    const payload = { action: reviewModal.type, comment: reviewModal.comment };
    if (reviewModal.type === "forward") {
      payload.receiver_office_id = reviewModal.officeId;
    }

    router.patch(`/dashboard/head/pending/${reviewModal.agendaId}`, payload, {
      preserveScroll: true,
      onSuccess: () => {
        setAgendas((prev) => prev.filter((a) => a.id !== reviewModal.agendaId));
        closeReviewModal();
      },
      onError: (errors) => {
        setActionError(errors.error || errors.comment || "Failed to submit review");
      },
      onFinish: () => {
        setActionLoadingId(null);
      },
    });
  }

  return (
    <HeadLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approval Workspace</h1>
          <p className="text-gray-600 mt-2">Review and process pending communications requiring your attention.</p>
          {actionError && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              <span className="font-semibold">Error:</span> {actionError}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Pending Communications</h2>
            <p className="text-sm text-gray-600 mt-1">Approve, reject or forward incoming documents.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Office</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agendas.map((agenda) => (
                  <tr key={agenda.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{agenda.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{agenda.created_by?.name || agenda.sender_office?.name || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{agenda.current_office?.name || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(agenda.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agenda.attachment_url ? (
                        <a
                          href={agenda.attachment_url}
                          className="text-blue-600 hover:text-blue-800 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedAgenda(agenda)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Details
                        </button>
                        <button
                          onClick={() => openReviewModal("approve", agenda.id)}
                          disabled={actionLoadingId === agenda.id}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors inline-flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => openReviewModal("reject", agenda.id)}
                          disabled={actionLoadingId === agenda.id}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors inline-flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => openReviewModal("forward", agenda.id)}
                          disabled={actionLoadingId === agenda.id}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors inline-flex items-center gap-1"
                        >
                          <ArrowRight className="w-4 h-4" />
                          Forward
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {agendas.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              <p>No pending communications to review.</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal.type && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {reviewModal.type === "forward" ? "Forward Communication" : `${reviewModal.type.charAt(0).toUpperCase() + reviewModal.type.slice(1)} Communication`}
            </h3>

            {reviewModal.type === "forward" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Forward to Office</label>
                <select
                  value={reviewModal.officeId}
                  onChange={(e) => setReviewModal({ ...reviewModal, officeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an office...</option>
                  {offices.map((office) => (
                    <option key={office.id} value={office.id}>{office.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {reviewModal.type === "reject" ? "Reject Reason (Required)" : "Comments (Optional)"}
              </label>
              <textarea
                value={reviewModal.comment}
                onChange={(e) => setReviewModal({ ...reviewModal, comment: e.target.value })}
                placeholder={reviewModal.type === "reject" ? "Enter reason for rejection..." : "Add your comments..."}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                required={reviewModal.type === "reject"}
              />
            </div>

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg text-sm text-red-700 border border-red-200">
                {actionError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeReviewModal}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={actionLoadingId !== null}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {actionLoadingId ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedAgenda && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Communication Details</h3>
              <button
                onClick={() => setSelectedAgenda(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Title</p>
                <p className="font-medium text-gray-900">{selectedAgenda.title || "-"}</p>
              </div>
              <div>
                <p className="text-gray-500">Sender</p>
                <p className="font-medium text-gray-900">{selectedAgenda.created_by?.name || selectedAgenda.sender_office?.name || "-"}</p>
              </div>
              <div>
                <p className="text-gray-500">Current Office</p>
                <p className="font-medium text-gray-900">{selectedAgenda.current_office?.name || "-"}</p>
              </div>
              <div>
                <p className="text-gray-500">Created</p>
                <p className="font-medium text-gray-900">{selectedAgenda.created_at ? new Date(selectedAgenda.created_at).toLocaleString() : "-"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-500">Description</p>
                <p className="font-medium text-gray-900 whitespace-pre-wrap">{selectedAgenda.description || "-"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-500">Attachment</p>
                {selectedAgenda.attachment_url ? (
                  <a
                    href={selectedAgenda.attachment_url}
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open attachment
                  </a>
                ) : (
                  <p className="font-medium text-gray-900">-</p>
                )}
              </div>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedAgenda(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </HeadLayout>
  );
}