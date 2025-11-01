'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { statisticsService } from '@/services/statisticsService'
import { useUpcomingReservations } from '@/hooks/useReservations'
import { useUserStatistics } from '@/hooks/useUser'

interface DashboardSummaryProps {
  userId: string
}

export default function DashboardSummary({ userId }: DashboardSummaryProps) {
  const t = useTranslations('dashboard')
  const tMachines = useTranslations('machines')
  const tCommon = useTranslations('common')
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { reservations: upcomingReservations } = useUpcomingReservations(userId, 24)
  const { stats: userStats } = useUserStatistics(userId)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const stats = await statisticsService.getDashboardStats()
        setDashboardStats(stats)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        // Set default stats on error
        setDashboardStats({
          totalMachines: 0,
          availableMachines: 0,
          inUseMachines: 0,
          reservedMachines: 0,
          maintenanceMachines: 0,
          brokenMachines: 0,
          totalUsers: 0,
          activeSessions: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="text-center py-8">{tCommon('loading')}</div>
  }

  return (
    <div className="space-y-6">
      {/* System Statistics */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{t('systemStatus')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-600 text-sm">{t('totalMachines')}</div>
            <div className="text-3xl font-bold text-teal-600">{dashboardStats?.totalMachines || 0}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <div className="text-gray-600 text-sm">{tMachines('status.available')}</div>
            <div className="text-3xl font-bold text-green-600">{dashboardStats?.availableMachines || 0}</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4">
            <div className="text-gray-600 text-sm">{tMachines('status.inUse')}</div>
            <div className="text-3xl font-bold text-red-600">{dashboardStats?.inUseMachines || 0}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <div className="text-gray-600 text-sm">{tMachines('status.reserved')}</div>
            <div className="text-3xl font-bold text-yellow-600">{dashboardStats?.reservedMachines || 0}</div>
          </div>
          <div className="bg-gray-50 rounded-lg shadow p-4">
            <div className="text-gray-600 text-sm">{tMachines('status.maintenance')}</div>
            <div className="text-3xl font-bold text-gray-600">{dashboardStats?.maintenanceMachines || 0}</div>
          </div>
          <div className="bg-black rounded-lg shadow p-4">
            <div className="text-gray-300 text-sm">{tMachines('status.broken') || 'Broken'}</div>
            <div className="text-3xl font-bold text-white">{dashboardStats?.brokenMachines || 0}</div>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{t('yourActivity')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-600 text-sm">{t('totalSessions')}</div>
            <div className="text-3xl font-bold text-teal-600">{userStats?.totalSessions || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-600 text-sm">{t('totalMinutes')}</div>
            <div className="text-3xl font-bold text-teal-600">{Math.round(userStats?.totalMinutes || 0)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-600 text-sm">{t('avgDuration')}</div>
            <div className="text-3xl font-bold text-teal-600">{Math.round(userStats?.averageSessionDuration || 0)}m</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-600 text-sm">{t('thisMonth')}</div>
            <div className="text-3xl font-bold text-teal-600">{userStats?.thisMonthSessions || 0}</div>
          </div>
        </div>
      </div>

      {/* Upcoming Reservations */}
      {upcomingReservations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">{t('upcomingReservations')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingReservations.slice(0, 4).map(reservation => (
              <div key={reservation.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-teal-500">
                <div className="font-semibold">{reservation.machines?.name}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {new Date(reservation.start_time).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {t('status')}: <span className="font-semibold capitalize">{reservation.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg shadow p-6 text-white">
        <h3 className="text-xl font-bold mb-2">{t('quickStats')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm opacity-90">{t('activeSessions')}</div>
            <div className="text-2xl font-bold">{dashboardStats?.activeSessions || 0}</div>
          </div>
          <div>
            <div className="text-sm opacity-90">{t('totalUsers')}</div>
            <div className="text-2xl font-bold">{dashboardStats?.totalUsers || 0}</div>
          </div>
          <div>
            <div className="text-sm opacity-90">{t('utilization')}</div>
            <div className="text-2xl font-bold">
              {dashboardStats?.availableMachines && dashboardStats?.totalMachines
                ? Math.round(((dashboardStats.totalMachines - dashboardStats.availableMachines) / dashboardStats.totalMachines) * 100)
                : 0}%
            </div>
          </div>
          <div>
            <div className="text-sm opacity-90">{t('yourReservations')}</div>
            <div className="text-2xl font-bold">{upcomingReservations.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

