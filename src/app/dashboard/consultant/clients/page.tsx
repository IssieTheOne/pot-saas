'use client'

import { useAuth } from '../../../../../lib/auth-context'

export default function ConsultantClientsPage() {
  const { user } = useAuth()

  const clients = [
    {
      id: 1,
      name: 'TechCorp Inc.',
      contact: 'Sarah Johnson',
      email: 'sarah@techcorp.com',
      phone: '+1 (555) 123-4567',
      industry: 'Technology',
      status: 'active',
      totalProjects: 2,
      totalRevenue: 42000,
      lastContact: '2024-01-15',
      avatar: '🏢'
    },
    {
      id: 2,
      name: 'StartupXYZ',
      contact: 'Mike Chen',
      email: 'mike@startupxyz.com',
      phone: '+1 (555) 234-5678',
      industry: 'Marketing',
      status: 'active',
      totalProjects: 1,
      totalRevenue: 15000,
      lastContact: '2024-01-14',
      avatar: '🚀'
    },
    {
      id: 3,
      name: 'Global Solutions Ltd.',
      contact: 'Emma Davis',
      email: 'emma@globalsolutions.com',
      phone: '+1 (555) 345-6789',
      industry: 'Consulting',
      status: 'prospect',
      totalProjects: 0,
      totalRevenue: 0,
      lastContact: '2024-01-10',
      avatar: '🌍'
    },
    {
      id: 4,
      name: 'Innovation Labs',
      contact: 'David Wilson',
      email: 'david@innovationlabs.com',
      phone: '+1 (555) 456-7890',
      industry: 'Healthcare',
      status: 'active',
      totalProjects: 1,
      totalRevenue: 45000,
      lastContact: '2024-01-12',
      avatar: '🔬'
    },
    {
      id: 5,
      name: 'Local Business Co.',
      contact: 'Lisa Brown',
      email: 'lisa@localbusiness.com',
      phone: '+1 (555) 567-8901',
      industry: 'Retail',
      status: 'inactive',
      totalProjects: 1,
      totalRevenue: 25000,
      lastContact: '2023-12-20',
      avatar: '🏪'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'prospect': return 'bg-blue-500/20 text-blue-400'
      case 'inactive': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const clientStats = {
    totalClients: 5,
    activeClients: 3,
    totalRevenue: 127000,
    avgProjectValue: 25400
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clients</h1>
          <p className="text-white/70">Manage your client relationships and contacts</p>
        </div>
        <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
          Add Client
        </button>
      </div>

      {/* Client Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mr-4">
              <span className="text-white text-xl">👥</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Clients</p>
              <p className="text-white text-2xl font-bold">{clientStats.totalClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mr-4">
              <span className="text-white text-xl">✅</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Active Clients</p>
              <p className="text-white text-2xl font-bold">{clientStats.activeClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-4">
              <span className="text-white text-xl">💰</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Revenue</p>
              <p className="text-white text-2xl font-bold">${clientStats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mr-4">
              <span className="text-white text-xl">📊</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Avg Project Value</p>
              <p className="text-white text-2xl font-bold">${clientStats.avgProjectValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-200 transform hover:scale-105">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-lg">{client.avatar}</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{client.name}</h3>
                  <p className="text-white/70 text-sm">{client.contact}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Email:</span>
                <span className="text-white text-sm">{client.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Phone:</span>
                <span className="text-white text-sm">{client.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Industry:</span>
                <span className="text-white text-sm">{client.industry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Last Contact:</span>
                <span className="text-white text-sm">{client.lastContact}</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-white/60 text-xs">Projects</p>
                  <p className="text-white font-bold">{client.totalProjects}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-xs">Revenue</p>
                  <p className="text-white font-bold">${client.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
                  📧 Email
                </button>
                <button className="text-green-400 hover:text-green-300 transition-colors text-sm">
                  📞 Call
                </button>
                <button className="text-purple-400 hover:text-purple-300 transition-colors text-sm">
                  📝 Note
                </button>
              </div>
              <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">Client Management</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm">Add Client</div>
          </button>
          <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            <div className="text-2xl mb-2">📧</div>
            <div className="text-sm">Send Newsletter</div>
          </button>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm">Client Reports</div>
          </button>
          <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            <div className="text-2xl mb-2">📞</div>
            <div className="text-sm">Schedule Call</div>
          </button>
        </div>
      </div>
    </div>
  )
}