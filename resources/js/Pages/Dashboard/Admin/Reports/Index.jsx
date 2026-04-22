import React from 'react';
import { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { 
  BarChart, 
  Download, 
  PieChart, 
  FileText, 
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  X,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  FileSpreadsheet,
  FileJson,
  Printer
} from "lucide-react";

export default function Index({ summary, reports, userActivity = [], officeActivity = [] }) {
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showFilters, setShowFilters] = useState(false);

  const filteredReports = reports.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  // Export to CSV function
  const exportToCSV = (report) => {
    setExporting(true);
    
    // Simulate data export - In real implementation, this would call your API
    setTimeout(() => {
      const headers = ['Report Name', 'Owner', 'Created At', 'Status', 'Data Points'];
      const data = [[
        report.name,
        report.owner,
        report.createdAt,
        report.status || 'Completed',
        report.dataPoints || 'N/A'
      ]];
      
      const csvContent = [
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.toLowerCase().replace(/\s+/g, '_')}_export.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setExporting(false);
    }, 1000);
  };

  // Export all reports to Excel/CSV
  const exportAllToCSV = () => {
    setExporting(true);
    
    setTimeout(() => {
      const headers = ['Report Name', 'Owner', 'Created At', 'Status'];
      const data = filteredReports.map(report => [
        report.name,
        report.owner,
        report.createdAt,
        report.status || 'Completed'
      ]);
      
      const csvContent = [
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all_reports_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setExporting(false);
    }, 1500);
  };

  // Export to JSON
  const exportToJSON = (report) => {
    setExporting(true);
    
    setTimeout(() => {
      const jsonData = {
        report: report,
        exportedAt: new Date().toISOString(),
        summary: summary
      };
      
      const jsonString = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.toLowerCase().replace(/\s+/g, '_')}_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setExporting(false);
    }, 1000);
  };

  // Print report
  const printReport = (report) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${report.name} - Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1e40af; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f3f4f6; }
            .header { margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${report.name}</h1>
            <p>Owner: ${report.owner}</p>
            <p>Created: ${report.createdAt}</p>
          </div>
          <table>
            <thead>
              <tr><th>Report Details</th><th>Value</th></tr>
            </thead>
            <tbody>
              <tr><td>Status</td><td>${report.status || 'Completed'}</td></tr>
              <tr><td>Data Points</td><td>${report.dataPoints || 'N/A'}</td></tr>
              <tr><td>Total Agendas</td><td>${summary?.totalAgendas ?? '-'}</td></tr>
              <tr><td>Pending</td><td>${summary?.pendingAgendas ?? '-'}</td></tr>
              <tr><td>Approved</td><td>${summary?.approvedAgendas ?? '-'}</td></tr>
              <tr><td>Rejected</td><td>${summary?.rejectedAgendas ?? '-'}</td></tr>
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Preview report
  const handlePreview = (report) => {
    setSelectedReport(report);
    setShowPreview(true);
  };

  const statsCards = [
    {
      title: "Total Agendas",
      value: summary?.totalAgendas ?? "-",
      icon: BarChart,
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      change: "+12%",
      trend: "up"
    },
    {
      title: "Pending",
      value: summary?.pendingAgendas ?? "-",
      icon: Clock,
      color: "yellow",
      gradient: "from-yellow-500 to-yellow-600",
      bgGradient: "from-yellow-50 to-yellow-100",
      change: "+5%",
      trend: "up"
    },
    {
      title: "Approved",
      value: summary?.approvedAgendas ?? "-",
      icon: CheckCircle,
      color: "green",
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      change: "+18%",
      trend: "up"
    },
    {
      title: "Rejected",
      value: summary?.rejectedAgendas ?? "-",
      icon: XCircle,
      color: "red",
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-50 to-red-100",
      change: "-3%",
      trend: "down"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="relative px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
                </div>
                <p className="text-blue-100 mt-1">Generate, export, and analyze system reports for tracking and compliance</p>
              </div>
              <button
                onClick={exportAllToCSV}
                disabled={exporting || filteredReports.length === 0}
                className="group flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
              >
                {exporting ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FileSpreadsheet className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                )}
                Export All
              </button>
            </div>
          </div>
        </div>

        {/* Activity Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Activity (Real Data)</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {userActivity.length > 0 ? (
                userActivity.map((row) => (
                  <div key={`${row.user}-${row.lastActivity}`} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{row.user}</p>
                      <p className="text-sm font-semibold text-blue-700">{row.actionsCount} actions</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Last activity: {row.lastActivity || '-'}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No user activity data yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Office Activity (Real Data)</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {officeActivity.length > 0 ? (
                officeActivity.map((row, idx) => (
                  <div key={`${row.office}-${idx}`} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{row.office}</p>
                      <p className="text-xs text-gray-500">{row.at || '-'}</p>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{row.action}</p>
                    <p className="text-xs text-gray-500 mt-1">By: {row.by}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No office activity data yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            const IconComponent = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
            const trendColor = stat.trend === 'up' ? 'text-green-600' : 'text-red-600';
            
            return (
              <div 
                key={index}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`bg-gradient-to-r ${stat.bgGradient} p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 bg-gradient-to-r ${stat.gradient} rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                    <span className={`text-sm font-medium ${trendColor}`}>{stat.change}</span>
                    <span className="text-xs text-gray-500">vs last month</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reports Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Available Reports
              </h2>
              <p className="text-gray-600 mt-1">Download, preview, or export report data in multiple formats</p>
            </div>
            <div className="flex gap-3">
              <div className="relative group">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports..."
                  className="pl-4 pr-10 py-2 border border-gray-300 rounded-xl w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          {showFilters && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
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
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-semibold">
                          {row.owner.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-600">{row.owner}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{row.createdAt}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {row.status || 'Completed'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePreview(row)}
                          className="p-2 text-blue-600 hover:text-blue-900 rounded-lg hover:bg-blue-50 transition-all transform hover:scale-110"
                          title="Preview Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <div className="relative group/tools">
                          <button
                            className="p-2 text-green-600 hover:text-green-900 rounded-lg hover:bg-green-50 transition-all transform hover:scale-110"
                            title="Export Options"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover/tools:opacity-100 group-hover/tools:visible transition-all z-10">
                            <button
                              onClick={() => exportToCSV(row)}
                              disabled={exporting}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg flex items-center gap-2"
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                              Export as CSV
                            </button>
                            <button
                              onClick={() => exportToJSON(row)}
                              disabled={exporting}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FileJson className="w-4 h-4" />
                              Export as JSON
                            </button>
                            <button
                              onClick={() => printReport(row)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg flex items-center gap-2"
                            >
                              <Printer className="w-4 h-4" />
                              Print Report
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No reports match your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Report Statistics Footer */}
          {filteredReports.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Showing <span className="font-semibold">{filteredReports.length}</span> of <span className="font-semibold">{reports.length}</span> reports
                </span>
                <div className="flex gap-4">
                  <span className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {showPreview && selectedReport && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto transform transition-all animate-slideUp">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl sticky top-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Report Preview</h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      setSelectedReport(null);
                    }}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedReport.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{selectedReport.owner}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{selectedReport.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600 font-medium">Total Agendas</p>
                      <p className="text-2xl font-bold text-blue-900">{summary?.totalAgendas ?? "-"}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-yellow-600 font-medium">Pending</p>
                      <p className="text-2xl font-bold text-yellow-900">{summary?.pendingAgendas ?? "-"}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600 font-medium">Approved</p>
                      <p className="text-2xl font-bold text-green-900">{summary?.approvedAgendas ?? "-"}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-red-600 font-medium">Rejected</p>
                      <p className="text-2xl font-bold text-red-900">{summary?.rejectedAgendas ?? "-"}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => exportToCSV(selectedReport)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Export to CSV
                    </button>
                    <button
                      onClick={() => printReport(selectedReport)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </AdminLayout>
  );
}