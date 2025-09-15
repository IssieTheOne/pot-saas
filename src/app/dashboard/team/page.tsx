'use client'

import { useAuth } from '../../../../lib/auth-context'
import { useEffect, useState } from 'react'
import { createClient } from '../../../../lib/supabase-client'

interface TeamMember {
  id: string
  user_id: string
  team_id: string
  role: string
  joined_at: string
  users: {
    full_name: string
    email: string
  }
}

export default function TeamPage() {
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchTeamMembers()
    }
  }, [user])

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          team_id,
          user_id,
          role,
          joined_at,
          users (
            full_name,
            email
          )
        `)
        .order('joined_at', { ascending: false })

      if (error) throw error
      setTeamMembers(data || [])
    } catch (error) {
      console.error('Error fetching team members:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAvatar = (name: string) => {
    const avatars = ['👩‍💼', '👨‍💻', '👩‍🎨', '👨‍💻', '👩‍💼', '👨‍💼', '👩‍💼', '👨‍💼']
    return avatars[name.length % avatars.length]
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
          <p className="text-white/70">Manage your team members and their roles</p>
        </div>
        <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
          Add Team Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-white/70">Loading team members...</p>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-white/70">No team members found. Invite your first team member to get started.</p>
          </div>
        ) : (
          teamMembers.map((member) => (
            <div key={member.id} className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-200 transform hover:scale-105">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 text-2xl">
                  {getAvatar(member.users?.full_name || 'Unknown')}
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{member.users?.full_name || 'Unknown'}</h3>
                <p className="text-blue-400 font-medium mb-2 capitalize">{member.role}</p>
                <p className="text-white/60 text-sm mb-4">{member.users?.email || 'No email'}</p>
                <div className="flex items-center justify-between w-full">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    Active
                  </span>
                  <div className="flex space-x-2">
                    <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
                      ✏️
                    </button>
                    <button className="text-red-400 hover:text-red-300 transition-colors text-sm">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">Team Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">{teamMembers.length}</div>
            <p className="text-white/70">Total Members</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{teamMembers.length}</div>
            <p className="text-white/70">Active Members</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">0</div>
            <p className="text-white/70">Away Members</p>
          </div>
        </div>
      </div>
    </div>
  )
}
