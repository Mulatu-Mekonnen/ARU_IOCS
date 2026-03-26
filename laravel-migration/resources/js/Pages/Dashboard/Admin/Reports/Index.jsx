import { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { BarChart, Download, PieChart } from "lucide-react";

export default function Index({ summary, reports }) {
  const [search, setSearch] = useState("");

  const filteredReports = reports.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and export system reports for tracking and compliance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Agendas</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{summary?.totalAgendas ?? "-"}</p>
              </div>
              <BarChart className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{summary?.pendingAgendas ?? "-"}</p>
              </div>
              <PieChart className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{summary?.approvedAgendas ?? "-"}</p>
              </div>
              <Download className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{summary?.rejectedAgendas ?? "-"}</p>
              </div>
              <Download className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Available Reports</h2>
              <p className="text-gray-600 mt-1">Download or preview report data based on your needs.</p>
            </div>
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports..."
                className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-t border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Report Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReports.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900">{row.name}</td>
                    <td className="px-6 py-4 text-gray-600">{row.owner}</td>
                    <td className="px-6 py-4 text-gray-600">{row.createdAt}</td>
                    <td className="px-6 py-4">
                      <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No reports match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}