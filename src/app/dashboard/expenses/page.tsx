'use client'

import { useAuth } from '../../../../lib/auth-context'

export default function ExpensesPage() {
  const { user } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Expenses</h1>
      <p className="text-white/70 mb-8">Track and manage your business expenses</p>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💼</div>
          <h2 className="text-xl font-bold text-white mb-2">Expense Tracking</h2>
          <p className="text-white/70 mb-6">Monitor and categorize your business expenses</p>
          <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            Add New Expense
          </button>
        </div>
      </div>
    </div>
  )
}
