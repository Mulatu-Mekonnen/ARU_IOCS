import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const demoAccounts = [
    { role: 'Admin', email: 'admin@office.com', password: 'admin123', color: 'from-red-500 to-pink-500' },
    { role: 'Head', email: 'muler@g', password: '1234', color: 'from-blue-500 to-purple-500' },
    { role: 'Staff', email: 'staff@office.com', password: 'user123', color: 'from-green-500 to-teal-500' },
    { role: 'Viewer', email: 'namste@G', password: '1234', color: 'from-yellow-500 to-orange-500' },
  ];

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setData({
      email: demoEmail,
      password: demoPassword,
      remember: true,
    });
    post('/login');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-yellow-25 flex items-center justify-center p-4 relative ">
      {/* Arsi University Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full"
             style={{
               backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
               backgroundSize: '40px 40px'
             }}>
        </div>
      </div>

      {/* Animated background elements in modern colors */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full opacity-5 blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Decorative elements in modern colors */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-600 rounded-full opacity-30 animate-bounce delay-700"></div>

        {/* Main card with modern styling */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-purple-500/30">
          {/* University Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-2 border-purple-400">
                <span className="text-white font-bold text-2xl">AU</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-blue-800 mb-2">IOCS</h1>
            <p className="text-blue-600/80">Portal Login</p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-500 mx-auto mt-3 rounded-full"></div>
          </div>

          {/* Error message */}
          {errors.email && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-blue-800">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 border-2 border-blue-200 rounded-lg text-blue-800 placeholder-blue-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-blue-800">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 border-2 border-blue-200 rounded-lg text-blue-800 placeholder-blue-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-blue-600 hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-blue-600 hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-blue-50 border-blue-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-blue-700">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit button with modern colors */}
            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Accounts Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors flex items-center justify-center mx-auto"
            >
              <svg className={`w-4 h-4 mr-2 transition-transform ${showDemo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showDemo ? 'Hide' : 'Show'} Demo Accounts (Development Only)
            </button>
          </div>

          {/* Demo Accounts Section */}
          {showDemo && (
            <div className="mt-6 space-y-3 opacity-100 transition-opacity duration-500">
              <div className="text-center">
                <p className="text-xs text-blue-600 mb-4">Quick login for testing different roles</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {demoAccounts.map((account, index) => (
                  <button
                    key={account.role}
                    onClick={() => handleDemoLogin(account.email, account.password)}
                    disabled={processing}
                    className={`p-3 bg-gradient-to-r ${account.color} text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-xs font-medium`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="font-semibold">{account.role}</div>
                    <div className="text-xs opacity-90">{account.email}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* University Footer */}
          <div className="mt-6 text-center text-xs text-blue-500">
            <p>© 2026 Arsi University. All rights reserved.</p>
            <p className="mt-1">Asella, Ethiopia</p>
          </div>
        </div>
      </div>
    </div>
  );
}