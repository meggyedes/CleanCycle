import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type ActivityLog = Database['public']['Tables']['activity_logs']['Row']

export const activityLogService = {
  /**
   * Log session start
   */
  async logSessionStart(userId: string, machineId: number, sessionId: number) {
    return this.createActivityLog(
      userId,
      machineId,
      sessionId,
      'Session started',
      'session_start',
      { machine_id: machineId }
    )
  },

  /**
   * Log session end
   */
  async logSessionEnd(userId: string, machineId: number, sessionId: number, duration: number) {
    return this.createActivityLog(
      userId,
      machineId,
      sessionId,
      'Session ended',
      'session_end',
      { machine_id: machineId, duration_minutes: duration }
    )
  },

  /**
   * Log reservation created
   */
  async logReservationCreated(userId: string, machineId: number, reservationId: number) {
    return this.createActivityLog(
      userId,
      machineId,
      null,
      'Reservation created',
      'reservation_created',
      { reservation_id: reservationId }
    )
  },

  /**
   * Log reservation cancelled
   */
  async logReservationCancelled(userId: string, machineId: number, reservationId: number) {
    return this.createActivityLog(
      userId,
      machineId,
      null,
      'Reservation cancelled',
      'reservation_cancelled',
      { reservation_id: reservationId }
    )
  },

  /**
   * Log error reported
   */
  async logErrorReported(machineId: number, errorCode: string, errorMessage: string) {
    return this.createActivityLog(
      null,
      machineId,
      null,
      `Error reported: ${errorMessage}`,
      'error_reported',
      { error_code: errorCode, error_message: errorMessage }
    )
  },

  /**
   * Log error resolved
   */
  async logErrorResolved(machineId: number, errorCode: string) {
    return this.createActivityLog(
      null,
      machineId,
      null,
      `Error resolved: ${errorCode}`,
      'error_resolved',
      { error_code: errorCode }
    )
  },

  /**
   * Log maintenance started
   */
  async logMaintenanceStarted(machineId: number, maintenanceType: string, performedBy?: string) {
    return this.createActivityLog(
      performedBy || null,
      machineId,
      null,
      `Maintenance started: ${maintenanceType}`,
      'maintenance_started',
      { maintenance_type: maintenanceType }
    )
  },

  /**
   * Log maintenance completed
   */
  async logMaintenanceCompleted(machineId: number, maintenanceType: string, performedBy?: string) {
    return this.createActivityLog(
      performedBy || null,
      machineId,
      null,
      `Maintenance completed: ${maintenanceType}`,
      'maintenance_completed',
      { maintenance_type: maintenanceType }
    )
  },

  /**
   * Create activity log entry
   */
  async createActivityLog(
    userId: string | null,
    machineId: number | null,
    sessionId: number | null,
    action: string,
    actionType: string,
    details?: Record<string, any>
  ) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        machine_id: machineId,
        session_id: sessionId,
        action,
        action_type: actionType,
        details: details || null
      })
      .select()
      .single()

    if (error) throw error
    return data as ActivityLog
  },

  /**
   * Get activity logs
   */
  async getActivityLogs(
    filters?: {
      userId?: string
      machineId?: number
      actionType?: string
      startDate?: Date
      endDate?: Date
    },
    limit = 100
  ) {
    const supabase = createClient()
    
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters?.machineId) {
      query = query.eq('machine_id', filters.machineId)
    }

    if (filters?.actionType) {
      query = query.eq('action_type', filters.actionType)
    }

    if (filters?.startDate) {
      query = query.gte('timestamp', filters.startDate.toISOString())
    }

    if (filters?.endDate) {
      query = query.lte('timestamp', filters.endDate.toISOString())
    }

    const { data, error } = await query

    if (error) throw error
    return data as ActivityLog[]
  },

  /**
   * Get machine activity logs
   */
  async getMachineActivityLogs(machineId: number, limit = 50) {
    return this.getActivityLogs({ machineId }, limit)
  },

  /**
   * Get user activity logs
   */
  async getUserActivityLogs(userId: string, limit = 50) {
    return this.getActivityLogs({ userId }, limit)
  }
}

