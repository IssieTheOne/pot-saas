'use client'

import { useAuth } from '../../../../../lib/auth-context'

export default function AdminFeaturesPage() {
  const { user } = useAuth()

  const features = [
    {
      id: 1,
      name: 'Document Management',
      description: 'Upload, organize, and share business documents',
      status: 'enabled',
      users: 1247,
      trials: 89,
      icon: '📄'
    },
    {
      id: 2,
      name: 'Team Collaboration',
      description: 'Invite team members and collaborate on projects',
      status: 'enabled',
      users: 856,
      trials: 45,
      icon: '👥'
    },
    {
      id: 3,
      name: 'Advanced Analytics',
      description: 'Detailed reports and business insights',
      status: 'beta',
      users: 234,
      trials: 67,
      icon: '📊'
    },
    {
      id: 4,
      name: 'API Access',
      description: 'Programmatic access to platform features',
      status: 'disabled',
      users: 0,
      trials: 12,
      icon: '🔌'
    },
    {
      id: 5,
      name: 'White Labeling',
      description: 'Custom branding and domain options',
      status: 'coming_soon',
      users: 0,
      trials: 0,
      icon: '🏷️'
    },
    {
      id: 6,
      name: 'Mobile App',
      description: 'Native mobile applications for iOS and Android',
      status: 'coming_soon',
      users: 0,
      trials: 0,
      icon: '📱'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled': return 'bg-green-500/20 text-green-400'
      case 'beta': return 'bg-yellow-500/20 text-yellow-400'
      case 'disabled': return 'bg-red-500/20 text-red-400'
      case 'coming_soon': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enabled': return 'Enabled'
      case 'beta': return 'Beta'
      case 'disabled': return 'Disabled'
      case 'coming_soon': return 'Coming Soon'
      default: return status
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Feature Management</h1>
          <p className="text-white/70">Control platform features and user access</p>
        </div>
        <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
          Add New Feature
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Platform Features</h2>
            <div className="flex space-x-2">
              <select className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Status</option>
                <option>Enabled</option>
                <option>Beta</option>
                <option>Disabled</option>
                <option>Coming Soon</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Feature</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Status</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Active Users</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Trial Users</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-lg">{feature.icon}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{feature.name}</p>
                        <p className="text-white/60 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                      {getStatusText(feature.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/70">{feature.users.toLocaleString()}</td>
                  <td className="px-6 py-4 text-white/70">{feature.trials}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        ✏️
                      </button>
                      {feature.status === 'enabled' && (
                        <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
                          ⏸️
                        </button>
                      )}
                      {feature.status === 'disabled' && (
                        <button className="text-green-400 hover:text-green-300 transition-colors">
                          ▶️
                        </button>
                      )}
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

      {/* Feature Usage Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mr-4">
              <span className="text-white text-xl">📈</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Feature Adoption</p>
              <p className="text-white text-2xl font-bold">78%</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mr-4">
              <span className="text-white text-xl">🧪</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Active Trials</p>
              <p className="text-white text-2xl font-bold">213</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-4">
              <span className="text-white text-xl">🚀</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">New Features</p>
              <p className="text-white text-2xl font-bold">3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
