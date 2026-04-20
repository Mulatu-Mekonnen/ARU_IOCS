import React from 'react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Index({ agendas, offices, filters }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [officeFilter, setOfficeFilter] = useState(filters.office || "");
  const [statusFilter, setStatusFilter] = useState(filters.status || "");
  const [currentPage, setCurrentPage] = useState(agendas.current_page);
  const [viewAgenda, setViewAgenda] = useState(null);
  const [forwarding, setForwarding] = useState({ agendaId: null, officeId: '' });
  const [forwardError, setForwardError] = useState('');

  const handleSearch = () => {
    router.get('/dashboard/admin/agendas', {
      search: searchTerm,
      office: officeFilter,
      status: statusFilter,
      page: 1,
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    router.get('/dashboard/admin/agendas', {
      search: searchTerm,
      office: officeFilter,
      status: statusFilter,
      page,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'FORWARDED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const performAction = (agendaId, action, extra = {}) => {
    router.put(`/dashboard/admin/agendas/${agendaId}`, {
      action,
      ...extra,
    }, {
      preserveScroll: true,
    });
  };

  const openForwardModal = (agendaId) => {
    setForwardError('');
    setForwarding({ agendaId, officeId: '' });
  };

  const closeForwardModal = () => {
    setForwardError('');
    setForwarding({ agendaId: null, officeId: '' });
  };

  const submitForward = () => {
    if (!forwarding.officeId) {
      setForwardError('Choose an office to forward to.');
      return;
    }

    performAction(forwarding.agendaId, 'forward', { receiver_office_id: forwarding.officeId });
    closeForwardModal();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda Management</h1>
          <p className="text-gray-600 mt-1">Review and manage all agendas across offices</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search agendas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={officeFilter}
              onChange={(e) => setOfficeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Offices</option>
              {offices.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="FORWARDED">Forwarded</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Office
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {agendas.data.map((agenda) => (
                  <tr key={agenda.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{agenda.title}</div>
                      <div className="text-sm text-gray-600 truncate max-w-xs">{agenda.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {agenda.current_office?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(agenda.status)}`}>
                        {agenda.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(agenda.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewAgenda(agenda)}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </button>

                        {agenda.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => performAction(agenda.id, 'approve')}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg shadow-sm text-sm font-medium text-green-700 hover:bg-green-100 hover:border-green-300 transition"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span className="hidden sm:inline">Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => performAction(agenda.id, 'reject')}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg shadow-sm text-sm font-medium text-red-700 hover:bg-red-100 hover:border-red-300 transition"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                              <span className="hidden sm:inline">Reject</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openForwardModal(agenda.id)}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg shadow-sm text-sm font-medium text-purple-700 hover:bg-purple-100 hover:border-purple-300 transition"
                              title="Forward"
                            >
                              <ArrowRight className="w-4 h-4" />
                              <span className="hidden sm:inline">Forward</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {agendas.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No agendas found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {agendas.last_page > 1 && (
            <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {agendas.from} to {agendas.to} of {agendas.total} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {agendas.last_page}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === agendas.last_page}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {viewAgenda && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Agenda Details</h2>
                  <p className="text-sm text-gray-500">ID #{viewAgenda.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewAgenda(null)}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Close</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Title</p>
                    <p className="mt-1 text-gray-900 font-semibold">{viewAgenda.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(viewAgenda.status)}`}>
                      {viewAgenda.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Created By</p>
                    <p className="mt-1 text-gray-900">{viewAgenda.created_by?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Created At</p>
                    <p className="mt-1 text-gray-900">{new Date(viewAgenda.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Sender Office</p>
                    <p className="mt-1 text-gray-900">{viewAgenda.sender_office?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Receiver Office</p>
                    <p className="mt-1 text-gray-900">{viewAgenda.receiver_office?.name || "—"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Description</p>
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap">{viewAgenda.description || "—"}</p>
                </div>

                {viewAgenda.attachment_url && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-600">Attachment</p>
                    <a
                      href={viewAgenda.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      View File
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setViewAgenda(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {forwarding.agendaId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Forward Agenda</h2>
                <button
                  type="button"
                  onClick={closeForwardModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Receiver Office</label>
                  <select
                    value={forwarding.officeId}
                    onChange={(e) => setForwarding({ ...forwarding, officeId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose office</option>
                    {offices.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  {forwardError && <p className="text-red-500 text-xs mt-2">{forwardError}</p>}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeForwardModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitForward}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Forward
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}