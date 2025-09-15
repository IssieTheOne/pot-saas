'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Download, Send, Eye } from 'lucide-react'

interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface Invoice {
  id: string
  invoice_number: string
  client_name: string
  client_email: string
  client_address: string
  status: string
  issue_date: string
  due_date: string
  tax_rate: number
  notes: string
  subtotal: number
  tax_amount: number
  total: number
  invoice_items: InvoiceItem[]
  created_by: {
    full_name: string
    email: string
  }
}

export default function InvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoice()
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch invoice')
      }
      const data = await response.json()
      setInvoice(data.invoice)
    } catch (error) {
      console.error('Error fetching invoice:', error)
      alert('Failed to load invoice')
      router.push('/dashboard/invoices')
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading invoice...</div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="text-white/60 mb-4">Invoice not found</div>
          <button
            onClick={() => router.back()}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">{invoice.invoice_number}</h1>
          <p className="text-white/70">Invoice details and information</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/invoices/${invoice.id}/edit`}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all">
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Client Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-white/60 text-sm font-medium">Client Name</label>
                <p className="text-white font-medium">{invoice.client_name}</p>
              </div>
              {invoice.client_email && (
                <div>
                  <label className="block text-white/60 text-sm font-medium">Client Email</label>
                  <p className="text-white">{invoice.client_email}</p>
                </div>
              )}
              {invoice.client_address && (
                <div>
                  <label className="block text-white/60 text-sm font-medium">Client Address</label>
                  <p className="text-white whitespace-pre-line">{invoice.client_address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Invoice Items</h2>
            <div className="space-y-4">
              {invoice.invoice_items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-white/10 last:border-b-0">
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.description}</p>
                    <p className="text-white/60 text-sm">Qty: {item.quantity} × ${item.unit_price.toFixed(2)}</p>
                  </div>
                  <div className="text-white font-medium">
                    ${item.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 border-t border-white/20 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal:</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Tax ({invoice.tax_rate}%):</span>
                  <span>${invoice.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg border-t border-white/20 pt-2">
                  <span>Total:</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">Notes</h2>
              <p className="text-white whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status and Dates */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Invoice Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm font-medium mb-1">Status</label>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
              <div>
                <label className="block text-white/60 text-sm font-medium mb-1">Issue Date</label>
                <p className="text-white">{new Date(invoice.issue_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-white/60 text-sm font-medium mb-1">Due Date</label>
                <p className="text-white">{new Date(invoice.due_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-white/60 text-sm font-medium mb-1">Created By</label>
                <p className="text-white">{invoice.created_by?.full_name || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href={`/dashboard/invoices/${invoice.id}/edit`}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                <Edit className="w-4 h-4" />
                Edit Invoice
              </Link>
              <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                <Send className="w-4 h-4" />
                Send to Client
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}