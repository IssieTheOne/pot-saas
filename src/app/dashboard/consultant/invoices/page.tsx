'use client'

import { useAuth } from '../../../../../lib/auth-context'

export default function ConsultantInvoicesPage() {
  const { user } = useAuth()

  const invoices = [
    {
      id: 1,
      number: 'INV-2024-001',
      client: 'TechCorp Inc.',
      project: 'E-commerce Platform Redesign',
      amount: 8000,
      status: 'paid',
      issueDate: '2024-01-10',
      dueDate: '2024-01-25',
      hours: 50,
      rate: 160
    },
    {
      id: 2,
      number: 'INV-2024-002',
      client: 'StartupXYZ',
      project: 'Digital Marketing Strategy',
      amount: 4800,
      status: 'sent',
      issueDate: '2024-01-12',
      dueDate: '2024-01-27',
      hours: 30,
      rate: 160
    },
    {
      id: 3,
      number: 'INV-2024-003',
      client: 'Innovation Labs',
      project: 'Mobile App Development',
      amount: 12000,
      status: 'overdue',
      issueDate: '2023-12-28',
      dueDate: '2024-01-12',
      hours: 75,
      rate: 160
    },
    {
      id: 4,
      number: 'INV-2024-004',
      client: 'TechCorp Inc.',
      project: 'E-commerce Platform Redesign',
      amount: 6400,
      status: 'draft',
      issueDate: null,
      dueDate: null,
      hours: 40,
      rate: 160
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400'
      case 'sent': return 'bg-blue-500/20 text-blue-400'
      case 'overdue': return 'bg-red-500/20 text-red-400'
      case 'draft': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const invoiceStats = {
    totalInvoiced: 31200,
    totalPaid: 8000,
    pendingPayment: 12000,
    overdueAmount: 12000
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Invoices</h1>
          <p className="text-white/70">Create and manage time-based invoices</p>
        </div>
        <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
          Create Invoice
        </button>
      </div>

      {/* Invoice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mr-4">
              <span className="text-white text-xl">💰</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Invoiced</p>
              <p className="text-white text-2xl font-bold">${invoiceStats.totalInvoiced.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mr-4">
              <span className="text-white text-xl">✅</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Paid</p>
              <p className="text-white text-2xl font-bold">${invoiceStats.totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg mr-4">
              <span className="text-white text-xl">⏳</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Pending</p>
              <p className="text-white text-2xl font-bold">${invoiceStats.pendingPayment.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg mr-4">
              <span className="text-white text-xl">⚠️</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Overdue</p>
              <p className="text-white text-2xl font-bold">${invoiceStats.overdueAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden mb-8">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Time-Based Invoices</h2>
            <div className="flex space-x-2">
              <select className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Status</option>
                <option>Draft</option>
                <option>Sent</option>
                <option>Paid</option>
                <option>Overdue</option>
              </select>
              <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200">
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Invoice</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Client</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Project</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Amount</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Hours</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Status</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Due Date</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{invoice.number}</div>
                    {invoice.issueDate && (
                      <div className="text-white/50 text-sm">Issued: {invoice.issueDate}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-white/70">{invoice.client}</td>
                  <td className="px-6 py-4 text-white/70 max-w-xs truncate">{invoice.project}</td>
                  <td className="px-6 py-4 text-white font-medium">${invoice.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-white/70">{invoice.hours}h @ ${invoice.rate}/h</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/70">{invoice.dueDate || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        👁️
                      </button>
                      <button className="text-green-400 hover:text-green-300 transition-colors">
                        ✏️
                      </button>
                      <button className="text-purple-400 hover:text-purple-300 transition-colors">
                        📧
                      </button>
                      <button className="text-red-400 hover:text-red-300 transition-colors">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Invoice Creation */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">Create Time-Based Invoice</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Client</label>
            <select className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Select client...</option>
              <option>TechCorp Inc.</option>
              <option>StartupXYZ</option>
              <option>Innovation Labs</option>
            </select>
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Project</label>
            <select className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Select project...</option>
              <option>E-commerce Platform Redesign</option>
              <option>Digital Marketing Strategy</option>
              <option>Mobile App Development</option>
            </select>
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Hourly Rate</label>
            <input
              type="number"
              placeholder="160"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Time Period</label>
            <select className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
              <option>Custom Range</option>
            </select>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-white/60 text-sm">
            This will automatically calculate hours from your timesheets
          </div>
          <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            Generate Invoice
          </button>
        </div>
      </div>
    </div>
  )
}