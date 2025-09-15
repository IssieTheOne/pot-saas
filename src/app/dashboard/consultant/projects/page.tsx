'use client'

import { useAuth } from '../../../../../lib/auth-context'

export default function ConsultantProjectsPage() {
  const { user } = useAuth()

  const projects = [
    {
      id: 1,
      name: 'E-commerce Platform Redesign',
      client: 'TechCorp Inc.',
      status: 'active',
      budget: 25000,
      spent: 18500,
      hours: 120,
      dueDate: '2024-02-15',
      progress: 75,
      priority: 'high'
    },
    {
      id: 2,
      name: 'Digital Marketing Strategy',
      client: 'StartupXYZ',
      status: 'active',
      budget: 15000,
      spent: 8200,
      hours: 85,
      dueDate: '2024-03-01',
      progress: 60,
      priority: 'medium'
    },
    {
      id: 3,
      name: 'Financial System Integration',
      client: 'Global Solutions Ltd.',
      status: 'planning',
      budget: 35000,
      spent: 0,
      hours: 0,
      dueDate: '2024-04-15',
      progress: 0,
      priority: 'high'
    },
    {
      id: 4,
      name: 'Mobile App Development',
      client: 'Innovation Labs',
      status: 'completed',
      budget: 45000,
      spent: 43200,
      hours: 280,
      dueDate: '2024-01-30',
      progress: 100,
      priority: 'high'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'planning': return 'bg-yellow-500/20 text-yellow-400'
      case 'completed': return 'bg-blue-500/20 text-blue-400'
      case 'on-hold': return 'bg-gray-500/20 text-gray-400'
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-yellow-500'
    if (progress >= 30) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-white/70">Manage and track your client projects</p>
        </div>
        <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
          New Project
        </button>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mr-4">
              <span className="text-white text-xl">📊</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Active Projects</p>
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
              <p className="text-white/60 text-sm">Total Budget</p>
              <p className="text-white text-2xl font-bold">$120K</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-4">
              <span className="text-white text-xl">⏰</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Hours</p>
              <p className="text-white text-2xl font-bold">485</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mr-4">
              <span className="text-white text-xl">✅</span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Completed</p>
              <p className="text-white text-2xl font-bold">1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-200 transform hover:scale-105">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">{project.name}</h3>
                <p className="text-white/70 text-sm mb-2">{project.client}</p>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                  <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-sm">Due</p>
                <p className="text-white font-medium">{project.dueDate}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70 text-sm">Progress</span>
                <span className="text-white text-sm font-medium">{project.progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-white/60 text-xs">Budget</p>
                <p className="text-white font-bold">${project.budget.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs">Spent</p>
                <p className="text-white font-bold">${project.spent.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs">Hours</p>
                <p className="text-white font-bold">{project.hours}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
                  👁️ View
                </button>
                <button className="text-green-400 hover:text-green-300 transition-colors text-sm">
                  ✏️ Edit
                </button>
                <button className="text-purple-400 hover:text-purple-300 transition-colors text-sm">
                  ⏰ Log Time
                </button>
              </div>
              <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm">
                Generate Invoice
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            <div className="text-2xl mb-2">📁</div>
            <div className="text-sm">New Project</div>
          </button>
          <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            <div className="text-2xl mb-2">⏰</div>
            <div className="text-sm">Log Time</div>
          </button>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm">View Reports</div>
          </button>
          <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            <div className="text-2xl mb-2">💳</div>
            <div className="text-sm">Create Invoice</div>
          </button>
        </div>
      </div>
    </div>
  )
}