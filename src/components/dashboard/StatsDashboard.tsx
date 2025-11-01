'use client'

import { useState, useEffect } from 'react'
import { useUserStatistics } from '@/hooks/useUser'
import { statisticsService } from '@/services/statisticsService'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

interface StatsDashboardProps {
  userId: string
}

export default function StatsDashboard({ userId }: StatsDashboardProps) {
  const { stats, loading } = useUserStatistics(userId)
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30')
  const [chartData, setChartData] = useState<any>(null)
  const [machineStats, setMachineStats] = useState<any>(null)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const data = await statisticsService.getUserUsageStats(userId, parseInt(timeRange))
        setChartData(data)
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
        // Set default chart data on error
        setChartData({
          totalSessions: 0,
          totalMinutes: 0,
          averageSessionDuration: 0,
          dailyData: [],
          machineUsage: {}
        })
      }
    }

    if (userId) {
      fetchChartData()
    }
  }, [userId, timeRange])

  if (loading) {
    return <div className="text-center py-8">Loading statistics...</div>
  }

  const COLORS = ['#14b8a6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b']

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['7', '30', '90'] as const).map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded ${
              timeRange === range
                ? 'bg-teal-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Last {range} days
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm">Total Sessions</div>
          <div className="text-3xl font-bold text-teal-600">{stats?.totalSessions || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm">Total Minutes</div>
          <div className="text-3xl font-bold text-teal-600">{Math.round(stats?.totalMinutes || 0)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm">Avg Duration</div>
          <div className="text-3xl font-bold text-teal-600">{Math.round(stats?.averageSessionDuration || 0)}m</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm">This Month</div>
          <div className="text-3xl font-bold text-teal-600">{stats?.thisMonthSessions || 0}</div>
        </div>
      </div>

      {/* Daily Usage Chart */}
      {chartData?.dailyData && chartData.dailyData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Daily Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Machine Usage Distribution */}
      {chartData?.machineUsage && Object.keys(chartData.machineUsage).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Machine Usage Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(chartData.machineUsage).map(([machineId, count], idx) => ({
                  name: `Machine ${machineId}`,
                  value: count as number
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(chartData.machineUsage).map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Usage Trend */}
      {chartData?.dailyData && chartData.dailyData.length > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Usage Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={{ fill: '#14b8a6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* No Data Message */}
      {(!chartData?.dailyData || chartData.dailyData.length === 0) && (
        <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-600">
          No usage data available for the selected period
        </div>
      )}
    </div>
  )
}

