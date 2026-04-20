import React from 'react';
import { useState } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
  MoreVertical,
  CheckCircle,
  XCircle,
  Users
} from "lucide-react";

export default function Index({ users, offices, filters }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [roleFilter, setRoleFilter] = useState(filters.role || "");
  const [statusFilter, setStatusFilter] = useState(filters.status || "");
  const [currentPage, setCurrentPage] = useState(users.current_page);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data, setData, processing, errors, reset, post, put } = useForm({
    name: "",
    email: "",
    password: "",
    role: "STAFF",
    office_id: "",
    active: true,
  });

  const handleEdit = (user) => {
    setEditing(user);
    setData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      office_id: user.office?.id || "",
      active: user.active,
    });
    setShowForm(true);
  };

  const handleDelete = (user) => {
    if (confirm(`Delete ${user.name}?`)) {
      router.delete(`/dashboard/admin/users/${user.id}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const options = {
      preserveScroll: true,
      onSuccess: () => {
        setShowForm(false);
        setEditing(null);
        reset();
      },
    };

    if (editing?.id) {
      put(`/dashboard/admin/users/${editing.id}`, options);
      return;
    }

    post('/dashboard/admin/users', options);
  };

  const handleSearch = () => {
    router.get('/dashboard/admin/users', {
      search: searchTerm,
      role: roleFilter,
      status: statusFilter,
      page: 1,
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    router.get('/dashboard/admin/users', {
      search: searchTerm,
      role: roleFilter,
      status: statusFilter,
      page,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setStatusFilter("");
    router.get('/dashboard/admin/users', { page: 1 });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">User Management</h1>
                </div>
                <p className="text-blue-100 mt-1">Manage system users and their permissions</p>
              </div>
              <button
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
                className="group flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.data?.filter(u => u.active).length || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Inactive Users</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.data?.filter(u => !u.active).length || 0}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Roles</p>
                <p className="text-2xl font-bold text-purple-600">4</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Filter className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer hover:border-blue-300 transition-colors"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="HEAD">Head</option>
              <option value="STAFF">Staff</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer hover:border-blue-300 transition-colors"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-sm hover:shadow"
            >
              Search
            </button>
            {(searchTerm || roleFilter || statusFilter) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Office
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
                {users.data.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                        user.role === 'ADMIN' ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 border border-purple-200' :
                        user.role === 'HEAD' ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200' :
                        user.role === 'STAFF' ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200' :
                        'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        <span className="text-gray-600">{user.office?.name || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                        user.active ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-all transform hover:scale-110"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-all transform hover:scale-110"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No users found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {users.last_page > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{users.from}</span> to <span className="font-semibold">{users.to}</span> of <span className="font-semibold">{users.total}</span> results
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, users.last_page) }, (_, i) => {
                    let pageNum;
                    if (users.last_page <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= users.last_page - 2) {
                      pageNum = users.last_page - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === users.last_page}
                  className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Form Modal - Enhanced */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-slideUp">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <UserPlus className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      {editing ? "Edit User" : "Add New User"}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditing(null);
                      reset();
                    }}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="Enter email address"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                {!editing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      placeholder="Enter password"
                      type="password"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={data.role}
                    onChange={(e) => setData('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="HEAD">Head</option>
                    <option value="STAFF">Staff</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                  {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Office Assignment</label>
                  <select
                    value={data.office_id}
                    onChange={(e) => setData('office_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="">No Office</option>
                    {offices.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  {errors.office_id && <p className="text-red-500 text-xs mt-1">{errors.office_id}</p>}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={data.active}
                    onChange={(e) => setData('active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 text-sm text-gray-700">Active Status</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {editing ? "Update User" : "Create User"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditing(null);
                      reset();
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
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