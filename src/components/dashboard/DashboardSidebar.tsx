'use client'

import { useState } from 'react'
import LogoutButton from './LogoutButton'
import SidebarLanguageSwitcher from './SidebarLanguageSwitcher'

interface DashboardSidebarProps {
  activeTab: 'overview' | 'machines' | 'statistics' | 'reservations' | 'profile'
  onTabChange: (tab: 'overview' | 'machines' | 'statistics' | 'reservations' | 'profile') => void
  userEmail?: string
}

export default function DashboardSidebar({ activeTab, onTabChange, userEmail }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: '📊', color: 'bg-teal-50 text-teal-700' },
    { id: 'machines', label: 'Machines', icon: '🧺', color: 'bg-blue-50 text-blue-700' },
    { id: 'statistics', label: 'Statistics', icon: '📈', color: 'bg-purple-50 text-purple-700' },
    { id: 'reservations', label: 'Reservations', icon: '📅', color: 'bg-orange-50 text-orange-700' },
    { id: 'profile', label: 'Profile', icon: '👤', color: 'bg-pink-50 text-pink-700' },
  ] as const

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen sticky top-0`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧺</span>
              <span className="font-bold text-gray-900">CleanCycle</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Language Switcher */}
        {!isCollapsed && (
          <SidebarLanguageSwitcher />
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === item.id
                ? `${item.color} font-semibold shadow-sm`
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            {!isCollapsed && <span className="text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {!isCollapsed && userEmail && (
          <div className="text-xs text-gray-600 truncate" title={userEmail}>
            {userEmail}
          </div>
        )}
        <LogoutButton />
      </div>
    </aside>
  )
}

