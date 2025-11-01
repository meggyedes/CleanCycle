'use client'

import { useState } from 'react'
import { Database } from '@/types/database.types'
import DashboardSummary from './DashboardSummary'
import StatsDashboard from './StatsDashboard'
import ReservationCalendar from './ReservationCalendar'
import UserProfile from './UserProfile'
import NotificationCenter from './NotificationCenter'
import DashboardSidebar from './DashboardSidebar'
import MachineGrid from './MachineGrid'

type Room = Database['public']['Tables']['rooms']['Row']
type Machine = Database['public']['Tables']['machines']['Row']

interface DashboardTabsProps {
  userId: string
  rooms: Room[]
  machines: Machine[]
  userEmail?: string
}

type TabType = 'overview' | 'machines' | 'statistics' | 'reservations' | 'profile'

export default function DashboardTabs({ userId, rooms, machines, userEmail }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'machines', label: 'Machines', icon: '🧺' },
    { id: 'statistics', label: 'Statistics', icon: '📈' },
    { id: 'reservations', label: 'Reservations', icon: '📅' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} userEmail={userEmail} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Notification Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-end">
          <NotificationCenter userId={userId} />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {activeTab === 'overview' && <DashboardSummary userId={userId} />}
            {activeTab === 'machines' && <MachineGrid rooms={rooms} />}
            {activeTab === 'statistics' && <StatsDashboard userId={userId} />}
            {activeTab === 'reservations' && <ReservationCalendar userId={userId} machines={machines} />}
            {activeTab === 'profile' && <UserProfile userId={userId} />}
          </div>
        </div>
      </div>
    </div>
  )
}

