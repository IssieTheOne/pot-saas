'use client'

import { useAuth } from '../../../../lib/auth-context'

export default function AdminPage() {
  const { user } = useAuth()

  const adminStats = [
    { title: 'Total Users', value: '1,247', change: '+12%', icon: '👥', color: 'from-blue-500 to-cyan-500' },
    { title: 'Active Subscriptions', value: '856', change: '+8%', icon: '💎', color: 'from-green-500 to-emerald-500' },
    { title: 'Revenue This Month', value: '$24,580', change: '+15%', icon: '💰', color: 'from-purple-500 to-pink-500' },
    { title: 'Support Tickets', value: '23', change: '-5%', icon: '🎫', color: 'from-orange-500 to-red-500' },
  ]

  const recentActivities = [
    { user: 'John Doe', action: 'Created new account', time: '2 minutes ago', type: 'user' },
    { user: 'Sarah Wilson', action: 'Upgraded to Pro plan', time: '15 minutes ago', type: 'subscription' },
    { user: 'Mike Johnson', action: 'Submitted support ticket', time: '1 hour ago', type: 'support' },
    { user: 'Emma Davis', action: 'Cancelled subscription', time: '2 hours ago', type: 'subscription' },
    { user: 'Alex Chen', action: 'Updated profile', time: '3 hours ago', type: 'user' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-white/70">Monitor and manage your SaaS platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {adminStats.map((stat, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">{stat.title}</p>
                <p className="text-white text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-green-400 text-sm mt-1">{stat.change} from last month</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                <span className="text-xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    activity.type === 'user' ? 'bg-blue-500/20' :
                    activity.type === 'subscription' ? 'bg-green-500/20' : 'bg-orange-500/20'
                  }`}>
                    <span className="text-sm">
                      {activity.type === 'user' ? '👤' :
                       activity.type === 'subscription' ? '💳' : '🎫'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{activity.user}</p>
                    <p className="text-white/60 text-sm">{activity.action}</p>
                  </div>
                </div>
                <span className="text-white/50 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm">Manage Users</div>
            </button>
            <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm">View Reports</div>
            </button>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="text-sm">System Settings</div>
            </button>
            <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
              <div className="text-2xl mb-2">🎫</div>
              <div className="text-sm">Support Tickets</div>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Management Link */}
      <div className="mt-8">
        <a
          href="/dashboard/admin/features"
          className="inline-flex items-center bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
        >
          <span className="mr-2">🚀</span>
          Manage Features
        </a>
      </div>
    </div>
  )
}
