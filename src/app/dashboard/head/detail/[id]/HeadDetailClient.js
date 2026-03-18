"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Eye, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function HeadDetailClient({ user, agendaId }) {
  const [agenda, setAgenda] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState({ type: null, comment: "" });

  useEffect(() => {
    if (!agendaId) return;
    loadAgendaDetails();
  }, [agendaId]);

  async function loadAgendaDetails() {
    setLoading(true);
    setError("");
    try {
      const [agendaRes, timelineRes] = await Promise.all([
        fetch(`/api/admin/agendas/${agendaId}`, { credentials: "include" }),
        fetch(`/api/agendas/${agendaId}/timeline`, { credentials: "include" })
      ]);

      if (!agendaRes.ok) throw new Error("Failed to load agenda details");
      if (!timelineRes.ok) throw new Error("Failed to load timeline");

      const agendaData = await agendaRes.json();
      const timelineData = await timelineRes.json();

      setAgenda(agendaData);
      setTimeline(timelineData.timeline || []);
    } catch (err) {
      setError(err.message || "Failed to load communication details");
    } finally {
      setLoading(false);
    }
  }

  function openReviewModal(type) {
    setReviewModal({ type, comment: "" });
  }

  function closeReviewModal() {
    setReviewModal({ type: null, comment: "" });
  }

  async function submitReview() {
    setActionLoading(true);
    try {
      const payload = { action: reviewModal.type, comment: reviewModal.comment };
      const res = await fetch(`/api/admin/agendas/${agendaId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update");

      closeReviewModal();
      loadAgendaDetails();
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setActionLoading(false);
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'REJECTED': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'FORWARDED': return <ArrowRight className="w-5 h-5 text-blue-600" />;
      default: return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'FORWARDED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  }

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading communication details...</p>
        </div>
      </div>
    );
  }

  if (error || !agenda) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard/head/pending"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pending Approvals
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-semibold">Error</p>
            <p className="text-red-600 mt-2">{error || "Communication not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/head/pending"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Approval Workspace
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Communication Details</h1>
              <p className="text-gray-600 mt-2">Reference #{agenda.id}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agenda.status)}`}>
                {getStatusIcon(agenda.status)}
                {agenda.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Communication Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Communication Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Subject</label>
                  <p className="mt-1 text-gray-900">{agenda.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Reference Number</label>
                  <p className="mt-1 text-gray-900">#{agenda.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Sender</label>
                  <p className="mt-1 text-gray-900">{agenda.senderOffice?.name || "Unknown"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Recipient</label>
                  <p className="mt-1 text-gray-900">{agenda.receiverOffice?.name || "Unknown"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Current Office</label>
                  <p className="mt-1 text-gray-900">{agenda.currentOffice?.name || "Unknown"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Created By</label>
                  <p className="mt-1 text-gray-900">{agenda.createdBy?.name || "Unknown"}</p>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Message Content</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{agenda.description || "No description provided."}</p>
              </div>
            </div>

            {/* Attachments */}
            {(agenda.attachmentUrl || agenda.attachment) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Attachments</h2>
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-gray-400" />
                  <a
                    href={agenda.attachmentUrl || agenda.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Download Attachment
                  </a>
                  {(agenda.attachmentUrl || agenda.attachment).toLowerCase().endsWith('.pdf') && (
                    <button
                      onClick={() => window.open(agenda.attachmentUrl || agenda.attachment, '_blank')}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Actions (only for pending) */}
            {agenda.status === 'PENDING' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => openReviewModal("approve")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openReviewModal("reject")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => openReviewModal("forward")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Forward
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline History</h2>
              <div className="space-y-4">
                {timeline.length > 0 ? (
                  timeline.map((item, index) => (
                    <div key={item.id || index} className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(item.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.action}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.at).toLocaleString()}
                        </p>
                        {item.by && (
                          <p className="text-xs text-gray-500">By: {item.by}</p>
                        )}
                        {item.comment && (
                          <p className="text-sm text-gray-700 mt-1">{item.comment}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No timeline history available.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Review Modal */}
        {reviewModal.type && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-lg font-semibold">
                  {reviewModal.type === "approve" && "Approve Communication"}
                  {reviewModal.type === "reject" && "Reject Communication"}
                  {reviewModal.type === "forward" && "Forward Communication"}
                </h2>
                <button onClick={closeReviewModal} className="text-gray-500 hover:text-gray-800">
                  Close
                </button>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">Comment (optional)</label>
                  <textarea
                    value={reviewModal.comment}
                    onChange={(e) => setReviewModal((r) => ({ ...r, comment: e.target.value }))}
                    className="mt-2 w-full border rounded px-3 py-2"
                    rows={3}
                    placeholder="Add a comment for the record"
                  />
                </div>
                {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
                <div className="flex justify-end gap-2">
                  <button onClick={closeReviewModal} className="px-4 py-2 bg-gray-200 rounded">
                    Cancel
                  </button>
                  <button
                    onClick={submitReview}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded text-white ${
                      reviewModal.type === "approve" ? "bg-green-600 hover:bg-green-700" :
                      reviewModal.type === "reject" ? "bg-red-600 hover:bg-red-700" :
                      "bg-blue-600 hover:bg-blue-700"
                    } disabled:opacity-50`}
                  >
                    {actionLoading ? "Processing..." :
                     reviewModal.type === "approve" ? "Approve" :
                     reviewModal.type === "reject" ? "Reject" : "Forward"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}