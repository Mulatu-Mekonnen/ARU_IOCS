import React from 'react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import HeadLayout from '../HeadLayout';
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

export default function Index({ agendas, filters }) {
  const [statusFilter, setStatusFilter] = useState(filters.status || "");
  const [currentPage, setCurrentPage] = useState(agendas.current_page);
  const [selectedAgenda, setSelectedAgenda] = useState(null);

  const handleSearch = () => {
    router.get('/dashboard/head/agendas', {
      status: statusFilter,
      page: 1,
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    router.get('/dashboard/head/agendas', {
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

  return (
    <HeadLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Office Agendas</h1>
          <p className="text-gray-600 mt-1">Manage agendas for your office</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
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
              Filter
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
                    From
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
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
                      {agenda.created_by?.name || 'Unknown'}
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
                      <button
                        onClick={() => setSelectedAgenda(agenda)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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
      </div>
      {selectedAgenda && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Agenda Details</h3>
              <button onClick={() => setSelectedAgenda(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Title:</span> <span className="font-medium text-gray-900">{selectedAgenda.title || '-'}</span></div>
              <div><span className="text-gray-500">From:</span> <span className="font-medium text-gray-900">{selectedAgenda.created_by?.name || selectedAgenda.sender_office?.name || '-'}</span></div>
              <div><span className="text-gray-500">Status:</span> <span className="font-medium text-gray-900">{selectedAgenda.status || '-'}</span></div>
              <div><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-900">{selectedAgenda.created_at ? new Date(selectedAgenda.created_at).toLocaleString() : '-'}</span></div>
              <div>
                <span className="text-gray-500">Description:</span>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedAgenda.description || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Attachment:</span>{' '}
                {selectedAgenda.attachment_url ? (
                  <a href={selectedAgenda.attachment_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Open attachment</a>
                ) : (
                  <span className="font-medium text-gray-900">-</span>
                )}
              </div>
            </div>
            <div className="mt-6 text-right">
              <button onClick={() => setSelectedAgenda(null)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </HeadLayout>
  );
}