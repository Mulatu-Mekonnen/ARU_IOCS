"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Search, Shield, Clock, ArrowLeft, ArrowRight } from "lucide-react";

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const tableContainerRef = useRef(null);

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) =>
        [log.user, log.userRole, log.action, log.category, log.details]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [search, logs]
  );

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/audit-logs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLogs(data);
        } else {
          setError(data?.error || "Unexpected response");
        }
      })
      .catch((err) => setError(err.message || "Failed to load logs"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">Comprehensive view of all administrative actions and system activities.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">System Activity Log</h2>
            <p className="text-gray-600 mt-1">Monitor all administrative actions including user management, office creation, communications, and approvals.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-72 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-600">
            Loading audit logs...
          </div>
        ) : (
          <div className="mt-6">
          <div className="mb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => tableContainerRef.current?.scrollBy({ left: -240, behavior: 'smooth' })}
              className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Left
            </button>
            <button
              type="button"
              onClick={() => tableContainerRef.current?.scrollBy({ left: 240, behavior: 'smooth' })}
              className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Right
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500">Use these controls to pan horizontally without scrolling down, even on narrow screens.</span>
          </div>
          <div ref={tableContainerRef} className="overflow-x-auto scroll-smooth"> 
            <table className="w-full">
              <thead className="bg-gray-50 border-t border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{log.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.userRole === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        log.userRole === 'HEAD' ? 'bg-blue-100 text-blue-800' :
                        log.userRole === 'STAFF' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.userRole}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">{log.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.category === 'Approval' ? 'bg-yellow-100 text-yellow-800' :
                        log.category === 'User Management' ? 'bg-blue-100 text-blue-800' :
                        log.category === 'Office Management' ? 'bg-purple-100 text-purple-800' :
                        log.category === 'Communications' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No log entries match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
