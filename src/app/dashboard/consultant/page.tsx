'use client'

import { useAuth } from '../../../../lib/auth-context'

export default function ConsultantPage() {
  const { user } = useAuth()

  const clients = [
    { id: 1, name: 'TechCorp Inc.', status: 'active', lastContact: '2 days ago', revenue: '$12,500', avatar: '🏢' },
    { id: 2, name: 'StartupXYZ', status: 'active', lastContact: '1 week ago', revenue: '$8,750', avatar: '🚀' },
    { id: 3, name: 'Global Solutions Ltd.', status: 'pending', lastContact: '3 days ago', revenue: '$0', avatar: '🌍' },
    { id: 4, name: 'Local Business Co.', status: 'completed', lastContact: '2 weeks ago', revenue: '$15,200', avatar: '🏪' },
    { id: 5, name: 'Innovation Labs', status: 'active', lastContact: '5 days ago', revenue: '$6,800', avatar: '🔬' },
  ]

  const upcomingTasks = [
    { id: 1, title: 'Q4 Strategy Review - TechCorp', client: 'TechCorp Inc.', date: '2024-01-20', priority: 'high', type: 'meeting' },
    { id: 2, title: 'Proposal Review - StartupXYZ', client: 'StartupXYZ', date: '2024-01-22', priority: 'medium', type: 'review' },
    { id: 3, title: 'Contract Finalization - Global Solutions', client: 'Global Solutions Ltd.', date: '2024-01-25', priority: 'high', type: 'contract' },
    { id: 4, title: 'Monthly Check-in - Innovation Labs', client: 'Innovation Labs', date: '2024-01-28', priority: 'low', type: 'meeting' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'completed': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Consultant Dashboard</h1>
        <p className="text-white/70">Manage your clients and consulting projects</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mr-4">
              <span className="text-white text-xl">👥</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Active Clients</p>
              <p className="text-white text-2xl font-bold">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mr-4">
              <span className="text-white text-xl">💰</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Monthly Revenue</p>
              <p className="text-white text-2xl font-bold">$28,050</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-4">
              <span className="text-white text-xl">📅</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Upcoming Tasks</p>
              <p className="text-white text-2xl font-bold">4</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mr-4">
              <span className="text-white text-xl">🎯</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Projects Completed</p>
              <p className="text-white text-2xl font-bold">12</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Client List */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">My Clients</h2>
            <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
              Add Client
            </button>
          </div>
          <div className="space-y-4">
            {clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-lg">{client.avatar}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{client.name}</p>
                    <p className="text-white/60 text-sm">Last contact: {client.lastContact}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium mb-2 block ${getStatusColor(client.status)}`}>
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
                  <p className="text-white/70 text-sm">{client.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Upcoming Tasks</h2>
            <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
              Schedule Task
            </button>
          </div>
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">{task.title}</h3>
                    <p className="text-white/60 text-sm mb-2">{task.client}</p>
                    <div className="flex items-center space-x-4">
                      <span className="text-white/50 text-sm">📅 {task.date}</span>
                      <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    task.type === 'meeting' ? 'bg-blue-500' :
                    task.type === 'review' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm">Generate Report</div>
          </button>
          <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            <div className="text-2xl mb-2">💳</div>
            <div className="text-sm">Send Invoice</div>
          </button>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-purple-600 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            <div className="text-2xl mb-2">📧</div>
            <div className="text-sm">Email Client</div>
          </button>
          <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm">Create Proposal</div>
          </button>
        </div>
      </div>
    </div>
  )
}
