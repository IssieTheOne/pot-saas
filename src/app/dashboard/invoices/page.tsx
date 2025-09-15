'use client'

import { useAuth } from '../../../../lib/auth-context'

export default function InvoicesPage() {
  const { user } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Invoices</h1>
      <p className="text-white/70 mb-8">Manage your business invoices and billing</p>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💳</div>
          <h2 className="text-xl font-bold text-white mb-2">Invoice Management</h2>
          <p className="text-white/70 mb-6">Create, send, and track your invoices</p>
          <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            Create New Invoice
          </button>
        </div>
      </div>
    </div>
  )
}
