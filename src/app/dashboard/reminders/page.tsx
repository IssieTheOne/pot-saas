'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Calendar, Clock, User, Trash2, Edit, Eye } from 'lucide-react'

interface Reminder {
  id: string
  title: string
  description: string
  reminder_type: string
  next_run: string
  is_active: boolean
  assigned_to: {
    full_name: string
    email: string
  } | null
  created_at: string
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    fetchReminders()
  }, [typeFilter])

  const fetchReminders = async () => {
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.append('type', typeFilter)

      const response = await fetch(`/api/reminders?${params}`)
      const data = await response.json()
      setReminders(data.reminders || [])
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteReminder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return

    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setReminders(reminders.filter(rem => rem.id !== id))
      } else {
        alert('Failed to delete reminder')
      }
    } catch (error) {
      console.error('Error deleting reminder:', error)
      alert('Error deleting reminder')
    }
  }

  const toggleReminder = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !isActive })
      })

      if (response.ok) {
        setReminders(reminders.map(rem =>
          rem.id === id ? { ...rem, is_active: !isActive } : rem
        ))
      } else {
        alert('Failed to update reminder')
      }
    } catch (error) {
      console.error('Error updating reminder:', error)
      alert('Error updating reminder')
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'one_time': return 'bg-blue-100 text-blue-800'
      case 'daily': return 'bg-green-100 text-green-800'
      case 'weekly': return 'bg-purple-100 text-purple-800'
      case 'monthly': return 'bg-orange-100 text-orange-800'
      case 'yearly': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredReminders = reminders.filter(reminder =>
    reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (reminder.description && reminder.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="text-3xl font-bold text-white mb-2">Reminders</h1>
          <p className="text-white/70">Manage recurring reminders and notifications</p>
        </div>
        <Link
          href="/dashboard/reminders/create"
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Reminder
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
                placeholder="Search reminders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="one_time">One Time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reminder Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <span className="text-white text-xl">🔔</span>
            </div>
            <div className="ml-4">
              <p className="text-white/60 text-sm">Total Reminders</p>
              <p className="text-white text-2xl font-bold">{reminders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <span className="text-white text-xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-white/60 text-sm">Active</p>
              <p className="text-white text-2xl font-bold">
                {reminders.filter(rem => rem.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
              <span className="text-white text-xl">⏰</span>
            </div>
            <div className="ml-4">
              <p className="text-white/60 text-sm">Due Today</p>
              <p className="text-white text-2xl font-bold">
                {reminders.filter(rem => {
                  const nextRun = new Date(rem.next_run)
                  const today = new Date()
                  return nextRun.toDateString() === today.toDateString() && rem.is_active
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
              <span className="text-white text-xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-white/60 text-sm">Overdue</p>
              <p className="text-white text-2xl font-bold">
                {reminders.filter(rem => {
                  const nextRun = new Date(rem.next_run)
                  const now = new Date()
                  return nextRun < now && rem.is_active
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reminders Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Reminder
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Next Run
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredReminders.map((reminder) => (
                <tr key={reminder.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {reminder.title}
                    </div>
                    <div className="text-sm text-white/60 max-w-xs truncate">
                      {reminder.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(reminder.reminder_type)}`}>
                      {reminder.reminder_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white/60" />
                      {new Date(reminder.next_run).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-white/60">
                      {new Date(reminder.next_run).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reminder.assigned_to ? (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-white/60" />
                        <div>
                          <div className="text-sm font-medium text-white">
                            {reminder.assigned_to.full_name}
                          </div>
                          <div className="text-sm text-white/60">
                            {reminder.assigned_to.email}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-white/60">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleReminder(reminder.id, reminder.is_active)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        reminder.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {reminder.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/reminders/${reminder.id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/reminders/${reminder.id}/edit`}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
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

        {filteredReminders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/60 mb-4">No reminders found</div>
            <Link
              href="/dashboard/reminders/create"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Reminder
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}