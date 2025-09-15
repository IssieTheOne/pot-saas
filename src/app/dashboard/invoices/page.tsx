'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Eye, Edit, Trash2, Download, Send } from 'lucide-react'

interface Invoice {
  id: string
  invoice_number: string
  client_name: string
  client_email: string
  status: string
  total: number
  due_date: string
  created_at: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [statusFilter])

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/invoices?${params}`)
      const data = await response.json()
      setInvoices(data.invoices || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return

    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setInvoices(invoices.filter(inv => inv.id !== id))
      } else {
        alert('Failed to delete invoice')
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
      alert('Error deleting invoice')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredInvoices = invoices.filter(invoice =>
    invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Invoices</h1>
          <p className="text-white/70">Manage your invoices and track payments</p>
        </div>
        <Link
          href="/dashboard/invoices/create"
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 mb-6 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <span className="text-white text-xl">📄</span>
            </div>
            <div className="ml-4">
              <p className="text-white/60 text-sm">Total Invoices</p>
              <p className="text-white text-2xl font-bold">{invoices.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <span className="text-white text-xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-white/60 text-sm">Paid</p>
              <p className="text-white text-2xl font-bold">
                {invoices.filter(inv => inv.status === 'paid').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
              <span className="text-white text-xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-white/60 text-sm">Pending</p>
              <p className="text-white text-2xl font-bold">
                {invoices.filter(inv => inv.status === 'sent').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
              <span className="text-white text-xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-white/60 text-sm">Overdue</p>
              <p className="text-white text-2xl font-bold">
                {invoices.filter(inv => inv.status === 'overdue').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {invoice.invoice_number}
                    </div>
                    <div className="text-sm text-white/60">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {invoice.client_name}
                    </div>
                    <div className="text-sm text-white/60">
                      {invoice.client_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    ${invoice.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/invoices/${invoice.id}/edit`}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteInvoice(invoice.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/60 mb-4">No invoices found</div>
            <Link
              href="/dashboard/invoices/create"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Invoice
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
