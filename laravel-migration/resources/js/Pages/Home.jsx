import { Link } from '@inertiajs/react';
import { Users, FileText, CheckCircle, Building, TrendingUp, Shield, Clock, ArrowRight } from 'lucide-react';

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-2">{value}</div>
      <div className="text-gray-600 font-medium">{title}</div>
    </div>
  );
}

export default function Home({ stats }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text- bg-gold text-sm font-bold mb-8">
              <Building className="w-4 h-4 mr-2" />
              ARU INTER-OFFICE COMMUNICATION SYSTEM
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              Streamline Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-indigo-600">
                Office Communications
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The complete solution for managing inter-office agendas, meetings, and department coordination
              at Arsi University. Secure, efficient, and user-friendly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Access Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our System?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Designed specifically for university administration with modern features and security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">Role-based access control with encrypted data storage</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600">Instant notifications and live status tracking</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
              <p className="text-gray-600">Comprehensive reporting and performance metrics</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Document Management</h3>
              <p className="text-gray-600">Secure file attachments and version control</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-role Support</h3>
              <p className="text-gray-600">Admin, Head, Staff, and Viewer roles with appropriate permissions</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Workflow Automation</h3>
              <p className="text-gray-600">Automated approval processes and status updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                System Statistics
              </h2>
              <p className="text-blue-100 text-lg">
                Real-time metrics from our university agenda system
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard
                title="Total Users"
                value={stats.totalUsers || 0}
                icon={Users}
              />
              <StatCard
                title="Total Agendas"
                value={stats.totalAgendas || 0}
                icon={FileText}
              />
              <StatCard
                title="Pending Approvals"
                value={stats.pendingAgendas || 0}
                icon={Clock}
              />
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-gray-300 text-lg mb-8 md:text-4xl font-bold ">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of university staff members using our system for efficient office communication
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Access Your Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-gray-300 font-medium mb-2">Need Access?</p>
            <p className="text-gray-400 text-sm">
              Contact your system administrator to set up your account credentials
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-lg font-semibold text-gray-900">ARU - IOCS</span>
            </div>
            <p className="text-gray-600 mb-4">
              © 2026 Arsi University Inter-Office Communication System. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Built with modern technology for efficient university administration
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}