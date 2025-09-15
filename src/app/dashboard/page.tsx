'use client'

import { useAuth } from '../../../lib/auth-context'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Welcome to Your Dashboard</h1>
      <p className="text-white/70 mb-8">Here's what's happening with your business today.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <span className="text-white text-xl">📄</span>
            </div>
            <div className="ml-4">
              <p className="text-white/60 text-sm">Total Documents</p>
              <p className="text-white text-2xl font-bold">24</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <span className="text-white text-xl">⬆️</span>
            </div>
            <div className="ml-4">
              <p className="text-white/60 text-sm">Uploads This Week</p>
              <p className="text-white text-2xl font-bold">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <span className="text-white text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-white/60 text-sm">Team Members</p>
              <p className="text-white text-2xl font-bold">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <span className="text-white text-xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-white/60 text-sm">Growth Rate</p>
              <p className="text-white text-2xl font-bold">+12%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <a href="/dashboard/documents" className="group">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-xl">📄</span>
            </div>
            <p className="text-white/70 text-sm text-center">Documents</p>
          </a>

          <a href="/dashboard/team" className="group">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-xl">👥</span>
            </div>
            <p className="text-white/70 text-sm text-center">Team</p>
          </a>

          <a href="/dashboard/invoices" className="group">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-xl">💳</span>
            </div>
            <p className="text-white/70 text-sm text-center">Invoices</p>
          </a>

          <a href="/dashboard/expenses" className="group">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-xl">💼</span>
            </div>
            <p className="text-white/70 text-sm text-center">Expenses</p>
          </a>

          <a href="/dashboard/reports" className="group">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-xl">📊</span>
            </div>
            <p className="text-white/70 text-sm text-center">Reports</p>
          </a>

          <a href="/dashboard/settings" className="group">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-slate-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-xl">⚙️</span>
            </div>
            <p className="text-white/70 text-sm text-center">Settings</p>
          </a>
        </div>
      </div>
    </div>
  )
}
