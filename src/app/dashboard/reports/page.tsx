'use client'

import { useAuth } from '../../../../lib/auth-context'

export default function ReportsPage() {
  const { user } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Reports</h1>
      <p className="text-white/70 mb-8">Generate and view business reports and analytics</p>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-white mb-2">Business Analytics</h2>
          <p className="text-white/70 mb-6">View detailed reports and insights about your business</p>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  )
}
