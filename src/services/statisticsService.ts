import { createClient } from '@/lib/supabase/client'

export const statisticsService = {
  /**
   * Get user usage statistics
   */
  async getUserUsageStats(userId: string, days = 30) {
    const supabase = createClient()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'finished')
      .gte('start_time', startDate.toISOString())
      .order('start_time')

    if (error) throw error

    // Calculate statistics
    const stats = {
      totalSessions: sessions?.length || 0,
      totalMinutes: 0,
      averageSessionDuration: 0,
      dailyData: [] as any[],
      machineUsage: {} as Record<number, number>
    }

    if (sessions && sessions.length > 0) {
      // Calculate total minutes and machine usage
      sessions.forEach(session => {
        const start = new Date(session.start_time).getTime()
        const end = new Date(session.end_time).getTime()
        const minutes = (end - start) / 60000
        stats.totalMinutes += minutes

        // Track machine usage
        stats.machineUsage[session.machine_id] = (stats.machineUsage[session.machine_id] || 0) + 1
      })

      stats.averageSessionDuration = stats.totalMinutes / stats.totalSessions

      // Group by day
      const dailyMap = new Map<string, number>()
      sessions.forEach(session => {
        const date = new Date(session.start_time).toISOString().split('T')[0]
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1)
      })

      stats.dailyData = Array.from(dailyMap.entries()).map(([date, count]) => ({
        date,
        sessions: count
      }))
    }

    return stats
  },

  /**
   * Get machine usage statistics
   */
  async getMachineUsageStats(machineId: number, days = 30) {
    const supabase = createClient()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('machine_id', machineId)
      .eq('status', 'finished')
      .gte('start_time', startDate.toISOString())
      .order('start_time')

    if (error) throw error

    const stats = {
      totalSessions: sessions?.length || 0,
      totalMinutes: 0,
      averageSessionDuration: 0,
      utilizationRate: 0,
      dailyData: [] as any[],
      hourlyData: [] as any[]
    }

    if (sessions && sessions.length > 0) {
      // Calculate total minutes
      sessions.forEach(session => {
        const start = new Date(session.start_time).getTime()
        const end = new Date(session.end_time).getTime()
        const minutes = (end - start) / 60000
        stats.totalMinutes += minutes
      })

      stats.averageSessionDuration = stats.totalMinutes / stats.totalSessions

      // Calculate utilization rate (percentage of time machine was in use)
      const totalHours = days * 24
      const totalMinutesAvailable = totalHours * 60
      stats.utilizationRate = (stats.totalMinutes / totalMinutesAvailable) * 100

      // Group by day
      const dailyMap = new Map<string, number>()
      sessions.forEach(session => {
        const date = new Date(session.start_time).toISOString().split('T')[0]
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1)
      })

      stats.dailyData = Array.from(dailyMap.entries()).map(([date, count]) => ({
        date,
        sessions: count
      }))

      // Group by hour
      const hourlyMap = new Map<number, number>()
      sessions.forEach(session => {
        const hour = new Date(session.start_time).getHours()
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1)
      })

      stats.hourlyData = Array.from(hourlyMap.entries()).map(([hour, count]) => ({
        hour: `${hour}:00`,
        sessions: count
      }))
    }

    return stats
  },

  /**
   * Get room statistics
   */
  async getRoomStats(roomId: number) {
    const supabase = createClient()

    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select('id, status')
      .eq('room_id', roomId)

    if (machinesError) throw machinesError

    const stats = {
      totalMachines: machines?.length || 0,
      availableMachines: 0,
      inUseMachines: 0,
      reservedMachines: 0,
      maintenanceMachines: 0,
      brokenMachines: 0
    }

    machines?.forEach(machine => {
      switch (machine.status) {
        case 'free':
          stats.availableMachines++
          break
        case 'running':
          stats.inUseMachines++
          break
        case 'booked':
          stats.reservedMachines++
          break
        case 'maintenance':
          stats.maintenanceMachines++
          break
        case 'broken':
          stats.brokenMachines++
          break
      }
    })

    return stats
  },

  /**
   * Get dashboard summary statistics
   */
  async getDashboardStats() {
    const supabase = createClient()

    const stats = {
      totalMachines: 0,
      availableMachines: 0,
      inUseMachines: 0,
      reservedMachines: 0,
      maintenanceMachines: 0,
      brokenMachines: 0,
      totalUsers: 0,
      activeSessions: 0
    }

    try {
      // Get all machines status
      const { data: machines, error: machinesError } = await supabase
        .from('machines')
        .select('status')

      if (!machinesError && machines) {
        stats.totalMachines = machines.length

        machines.forEach(machine => {
          switch (machine.status) {
            case 'free':
              stats.availableMachines++
              break
            case 'running':
              stats.inUseMachines++
              break
            case 'booked':
              stats.reservedMachines++
              break
            case 'maintenance':
              stats.maintenanceMachines++
              break
            case 'broken':
              stats.brokenMachines++
              break
          }
        })
      }
    } catch (error) {
      console.error('Error fetching machines stats:', error)
    }

    try {
      // Get total users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id', { count: 'exact' })

      if (!usersError && users) {
        stats.totalUsers = users.length
      }
    } catch (error) {
      console.error('Error fetching users count:', error)
    }

    try {
      // Get active sessions (this might fail due to RLS, so we handle it gracefully)
      const { data: activeSessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('id', { count: 'exact' })
        .eq('status', 'active')

      if (!sessionsError && activeSessions) {
        stats.activeSessions = activeSessions.length
      }
    } catch (error) {
      console.error('Error fetching active sessions:', error)
      // This is expected if user is not admin - just use 0
      stats.activeSessions = 0
    }

    return stats
  }
}

