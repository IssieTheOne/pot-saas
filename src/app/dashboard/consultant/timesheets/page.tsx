'use client'

import { useAuth } from '../../../../../lib/auth-context'

export default function ConsultantTimesheetsPage() {
  const { user } = useAuth()

  const timesheets = [
    {
      id: 1,
      project: 'E-commerce Platform Redesign',
      client: 'TechCorp Inc.',
      date: '2024-01-15',
      hours: 8,
      description: 'UI/UX design and prototyping',
      billable: true,
      status: 'approved'
    },
    {
      id: 2,
      project: 'Digital Marketing Strategy',
      client: 'StartupXYZ',
      date: '2024-01-15',
      hours: 6,
      description: 'Market research and analysis',
      billable: true,
      status: 'pending'
    },
    {
      id: 3,
      project: 'E-commerce Platform Redesign',
      client: 'TechCorp Inc.',
      date: '2024-01-14',
      hours: 7.5,
      description: 'Backend API development',
      billable: true,
      status: 'approved'
    },
    {
      id: 4,
      project: 'Mobile App Development',
      client: 'Innovation Labs',
      date: '2024-01-14',
      hours: 8,
      description: 'React Native implementation',
      billable: true,
      status: 'approved'
    },
    {
      id: 5,
      project: 'Digital Marketing Strategy',
      client: 'StartupXYZ',
      date: '2024-01-13',
      hours: 4,
      description: 'Content strategy planning',
      billable: true,
      status: 'pending'
    }
  ]

  const weeklyStats = {
    totalHours: 33.5,
    billableHours: 31.5,
    nonBillableHours: 2,
    thisWeek: 'Jan 8-14, 2024',
    billableRate: 85
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'rejected': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Timesheets</h1>
          <p className="text-white/70">Track and manage your billable hours</p>
        </div>
        <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
          Log Time
        </button>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mr-4">
              <span className="text-white text-xl">⏰</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Hours</p>
              <p className="text-white text-2xl font-bold">{weeklyStats.totalHours}</p>
              <p className="text-white/50 text-xs">{weeklyStats.thisWeek}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mr-4">
              <span className="text-white text-xl">💰</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Billable Hours</p>
              <p className="text-white text-2xl font-bold">{weeklyStats.billableHours}</p>
              <p className="text-green-400 text-xs">{weeklyStats.billableRate}% billable</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-4">
              <span className="text-white text-xl">📊</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">This Week</p>
              <p className="text-white text-2xl font-bold">4.2h</p>
              <p className="text-white/50 text-xs">avg per day</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mr-4">
              <span className="text-white text-xl">🎯</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Target</p>
              <p className="text-white text-2xl font-bold">40h</p>
              <p className="text-yellow-400 text-xs">84% achieved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timesheet Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden mb-8">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Timesheets</h2>
            <div className="flex space-x-2">
              <select className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
                <option>Last Month</option>
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
                <th className="px-6 py-4 text-left text-white/70 font-medium">Project</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Client</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Date</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Hours</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Description</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Billable</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Status</th>
                <th className="px-6 py-4 text-left text-white/70 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {timesheets.map((entry) => (
                <tr key={entry.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{entry.project}</div>
                  </td>
                  <td className="px-6 py-4 text-white/70">{entry.client}</td>
                  <td className="px-6 py-4 text-white/70">{entry.date}</td>
                  <td className="px-6 py-4 text-white font-medium">{entry.hours}h</td>
                  <td className="px-6 py-4 text-white/70 max-w-xs truncate">{entry.description}</td>
                  <td className="px-6 py-4">
                    {entry.billable ? (
                      <span className="text-green-400">💰</span>
                    ) : (
                      <span className="text-gray-400">🚫</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        ✏️
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

      {/* Quick Time Entry */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">Quick Time Entry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <label className="block text-white/70 text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Hours</label>
            <input
              type="number"
              step="0.25"
              placeholder="8.0"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
              Add Entry
            </button>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-white/70 text-sm font-medium mb-2">Description</label>
          <textarea
            placeholder="What did you work on?"
            rows={3}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
      </div>
    </div>
  )
}