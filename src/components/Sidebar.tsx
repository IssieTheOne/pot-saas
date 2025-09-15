'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Home,
  FileText,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User,
  Crown,
  Shield,
  Briefcase,
  Sparkles,
  FolderOpen
} from 'lucide-react'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  user: any
}

export default function Sidebar({ isCollapsed, onToggle, user }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<{[key: string]: boolean}>({})

  // Default avatar options
  const defaultAvatars = [
    { id: 'gradient-1', type: 'gradient', colors: 'from-purple-500 to-cyan-500', emoji: '🚀' },
    { id: 'gradient-2', type: 'gradient', colors: 'from-green-500 to-emerald-500', emoji: '💼' },
    { id: 'gradient-3', type: 'gradient', colors: 'from-blue-500 to-indigo-500', emoji: '📊' },
    { id: 'gradient-4', type: 'gradient', colors: 'from-orange-500 to-red-500', emoji: '⚡' },
    { id: 'gradient-5', type: 'gradient', colors: 'from-pink-500 to-purple-500', emoji: '🎯' },
    { id: 'gradient-6', type: 'gradient', colors: 'from-teal-500 to-cyan-500', emoji: '💡' },
    { id: 'emoji-1', type: 'emoji', emoji: '👨‍💼', bg: 'bg-blue-500' },
    { id: 'emoji-2', type: 'emoji', emoji: '👩‍💼', bg: 'bg-purple-500' },
    { id: 'emoji-3', type: 'emoji', emoji: '🧑‍💻', bg: 'bg-green-500' },
    { id: 'emoji-4', type: 'emoji', emoji: '👨‍🎨', bg: 'bg-orange-500' },
    { id: 'emoji-5', type: 'emoji', emoji: '👩‍🎨', bg: 'bg-pink-500' },
    { id: 'emoji-6', type: 'emoji', emoji: '🧑‍🚀', bg: 'bg-indigo-500' },
  ]

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleAvatarSelect = (avatar: any) => {
    setShowAvatarPicker(false)
    // Here you would typically save to database
    localStorage.setItem('userAvatar', avatar.id)
  }

  const getCurrentAvatar = () => {
    const saved = localStorage.getItem('userAvatar')
    return defaultAvatars.find(avatar => avatar.id === saved) || defaultAvatars[0]
  }

  const getUserRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'owner':
        return { emoji: '👑', label: 'Owner', color: 'bg-gradient-to-r from-yellow-500 to-orange-500', icon: Crown }
      case 'admin':
        return { emoji: '🛡️', label: 'Admin', color: 'bg-gradient-to-r from-blue-500 to-indigo-500', icon: Shield }
      case 'manager':
        return { emoji: '📋', label: 'Manager', color: 'bg-gradient-to-r from-green-500 to-teal-500', icon: Briefcase }
      case 'consultant':
        return { emoji: '🎯', label: 'Consultant', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: User }
      default:
        return { emoji: '👤', label: 'Employee', color: 'bg-gradient-to-r from-gray-500 to-slate-500', icon: User }
    }
  }

  const renderAvatar = (avatar: any, size: string = 'w-10 h-10') => {
    if (avatar.type === 'gradient') {
      return (
        <div className={`${size} bg-gradient-to-r ${avatar.colors} rounded-lg flex items-center justify-center shadow-lg`}>
          <span className="text-white text-lg">{avatar.emoji}</span>
        </div>
      )
    } else {
      return (
        <div className={`${size} ${avatar.bg} rounded-lg flex items-center justify-center shadow-lg`}>
          <span className="text-2xl">{avatar.emoji}</span>
        </div>
      )
    }
  }

  const toggleSubmenu = (menuKey: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }))
  }

  const isUserConsultant = user?.user_metadata?.job_title?.toLowerCase() === 'consultant' ||
                          user?.user_metadata?.role?.toLowerCase() === 'consultant' ||
                          true // Temporarily show for all users for testing

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', description: 'Overview & quick actions' },
    { icon: Sparkles, label: 'Marketplace', href: '/dashboard/marketplace', description: 'Discover & request features' },
    { icon: FolderOpen, label: 'Documents', href: '/dashboard/documents', description: 'File storage & management' },
    { icon: FileText, label: 'Invoices', href: '/dashboard/invoices', description: 'Create & manage invoices' },
    { icon: DollarSign, label: 'Expenses', href: '/dashboard/expenses', description: 'Track business expenses' },
    { icon: Users, label: 'Team', href: '/dashboard/team', description: 'Manage team members' },
    { icon: BarChart3, label: 'Reports', href: '/dashboard/reports', description: 'Analytics & insights' },
    { icon: Shield, label: 'Admin', href: '/dashboard/admin', description: 'System administration' },
    {
      icon: Briefcase,
      label: 'Consultant',
      href: '/dashboard/consultant',
      description: 'Client & project management',
      isExpandable: true,
      menuKey: 'consultant',
      subItems: isUserConsultant ? [
        { label: 'Overview', href: '/dashboard/consultant', icon: '📊' },
        { label: 'Projects', href: '/dashboard/consultant/projects', icon: '📁' },
        { label: 'Timesheets', href: '/dashboard/consultant/timesheets', icon: '⏰' },
        { label: 'Clients', href: '/dashboard/consultant/clients', icon: '👥' },
        { label: 'Invoices', href: '/dashboard/consultant/invoices', icon: '💳' },
      ] : []
    },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings', description: 'Account preferences' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}>
        <div className="flex flex-col h-full bg-white/10 backdrop-blur-xl border-r border-white/20 shadow-2xl">

          {/* Header with Logo and Toggle */}
          <div className="flex items-center justify-between h-20 px-4 border-b border-white/10">
            {!isCollapsed && (
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold text-white truncate">Pot SaaS</h1>
                  <p className="text-xs text-white/60 truncate">Business Management</p>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="flex justify-center w-full">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
              </div>
            )}
            <button
              onClick={onToggle}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 group"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
              ) : (
                <ChevronLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.isExpandable && item.subItems && item.subItems.length > 0 ? (
                  // Expandable menu item
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.menuKey!)}
                      className={`group flex items-center w-full px-3 py-3 rounded-xl transition-all duration-200 ${
                        expandedMenus[item.menuKey!] || pathname.startsWith(item.href)
                          ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white shadow-lg border border-purple-400/30'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${
                        expandedMenus[item.menuKey!] || pathname.startsWith(item.href) ? 'text-purple-300' : 'text-white/60 group-hover:text-white'
                      }`} />
                      {!isCollapsed && (
                        <>
                          <span className="font-medium ml-3 flex-1">{item.label}</span>
                          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                            expandedMenus[item.menuKey!] ? 'rotate-90' : ''
                          }`} />
                        </>
                      )}
                    </button>

                    {/* Submenu items */}
                    {expandedMenus[item.menuKey!] && !isCollapsed && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.subItems!.map((subItem, subIndex) => (
                          <a
                            key={subIndex}
                            href={subItem.href}
                            className={`group flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                              pathname === subItem.href
                                ? 'bg-gradient-to-r from-purple-500/15 to-cyan-500/15 text-white border border-purple-400/20'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span className="mr-3">{subItem.icon}</span>
                            <span className="font-medium">{subItem.label}</span>
                            {pathname === subItem.href && (
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full ml-auto"></div>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular menu item
                  <a
                    href={item.href}
                    className={`group flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white shadow-lg border border-purple-400/30'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${
                      isActive(item.href) ? 'text-purple-300' : 'text-white/60 group-hover:text-white'
                    }`} />
                    {!isCollapsed && (
                      <>
                        <span className="font-medium ml-3 flex-1">{item.label}</span>
                        {isActive(item.href) && (
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        )}
                      </>
                    )}
                  </a>
                )}
              </div>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="p-3 border-t border-white/10">
            {!isCollapsed ? (
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 cursor-pointer group"
                   onClick={() => setShowAvatarPicker(true)}>
                <div className="relative">
                  {renderAvatar(getCurrentAvatar())}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium truncate">{user?.name || 'User'}</p>
                  <div className="flex items-center space-x-1">
                    {(() => {
                      const roleBadge = getUserRoleBadge(user?.role)
                      const RoleIcon = roleBadge.icon
                      return (
                        <>
                          <RoleIcon className="w-3 h-3 text-white/60" />
                          <span className="text-xs text-white/60 truncate">{roleBadge.label}</span>
                        </>
                      )
                    })()}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLogout()
                  }}
                  className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowAvatarPicker(true)}
                  className="relative group"
                  title={`${user?.name || 'User'} (${getUserRoleBadge(user?.role).label})`}
                >
                  {renderAvatar(getCurrentAvatar())}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAvatarPicker(false)} />
          <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Choose Your Avatar</h3>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {defaultAvatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleAvatarSelect(avatar)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 group"
                >
                  <div className="flex flex-col items-center space-y-2">
                    {renderAvatar(avatar, 'w-12 h-12')}
                    <span className="text-white/60 text-xs group-hover:text-white transition-colors">
                      {avatar.type === 'gradient' ? 'Style' : 'Emoji'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-white/60 text-sm text-center">
                More avatar options coming soon! 🎨
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
