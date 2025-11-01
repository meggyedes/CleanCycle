import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Machine = Database['public']['Tables']['machines']['Row']
type MachineError = Database['public']['Tables']['machine_errors']['Row']
type MaintenanceHistory = Database['public']['Tables']['maintenance_history']['Row']

export const machineService = {
  /**
   * Get all machines
   */
  async getAllMachines() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .order('room_id')
      .order('name')

    if (error) throw error
    return data as Machine[]
  },

  /**
   * Get machines by room
   */
  async getMachinesByRoom(roomId: number) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .eq('room_id', roomId)
      .order('type')
      .order('name')

    if (error) throw error
    return data as Machine[]
  },

  /**
   * Get machine by ID
   */
  async getMachineById(machineId: number) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .eq('id', machineId)
      .single()

    if (error) throw error
    return data as Machine
  },

  /**
   * Get machine with errors
   */
  async getMachineWithErrors(machineId: number) {
    const supabase = createClient()
    const { data: machine, error: machineError } = await supabase
      .from('machines')
      .select('*')
      .eq('id', machineId)
      .single()

    if (machineError) throw machineError

    const { data: errors, error: errorsError } = await supabase
      .from('machine_errors')
      .select('*')
      .eq('machine_id', machineId)
      .eq('resolved', false)
      .order('created_at', { ascending: false })

    if (errorsError) throw errorsError

    return {
      machine: machine as Machine,
      errors: errors as MachineError[]
    }
  },

  /**
   * Get machine maintenance history
   */
  async getMachineMaintenanceHistory(machineId: number, limit = 10) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('maintenance_history')
      .select('*')
      .eq('machine_id', machineId)
      .order('start_time', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as MaintenanceHistory[]
  },

  /**
   * Update machine status
   */
  async updateMachineStatus(machineId: number, status: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('machines')
      .update({ status })
      .eq('id', machineId)
      .select()
      .single()

    if (error) throw error
    return data as Machine
  },

  /**
   * Report machine error
   */
  async reportMachineError(
    machineId: number,
    errorCode: string,
    errorMessage: string,
    severity: 'info' | 'warning' | 'critical' = 'warning'
  ) {
    const supabase = createClient()
    
    // Create error record
    const { data: error, error: errorError } = await supabase
      .from('machine_errors')
      .insert({
        machine_id: machineId,
        error_code: errorCode,
        error_message: errorMessage,
        severity
      })
      .select()
      .single()

    if (errorError) throw errorError

    // Update machine status if critical
    if (severity === 'critical') {
      await this.updateMachineStatus(machineId, 'broken')
    }

    return error as MachineError
  },

  /**
   * Resolve machine error
   */
  async resolveMachineError(errorId: number) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('machine_errors')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString()
      })
      .eq('id', errorId)
      .select()
      .single()

    if (error) throw error
    return data as MachineError
  },

  /**
   * Get available machines for time slot
   */
  async getAvailableMachinesForTimeSlot(
    roomId: number,
    startTime: Date,
    endTime: Date,
    machineType?: 'washer' | 'dryer'
  ) {
    const supabase = createClient()
    
    let query = supabase
      .from('machines')
      .select('*')
      .eq('room_id', roomId)
      .eq('status', 'free')

    if (machineType) {
      query = query.eq('type', machineType)
    }

    const { data: machines, error } = await query

    if (error) throw error

    // Filter out machines with conflicting reservations
    const machineIds = (machines as Machine[]).map(m => m.id)
    
    const { data: reservations, error: reservError } = await supabase
      .from('reservations')
      .select('machine_id')
      .in('machine_id', machineIds)
      .eq('status', 'confirmed')
      .or(`and(start_time.lt.${endTime.toISOString()},end_time.gt.${startTime.toISOString()})`)

    if (reservError) throw reservError

    const reservedMachineIds = new Set((reservations as any[]).map(r => r.machine_id))
    
    return (machines as Machine[]).filter(m => !reservedMachineIds.has(m.id))
  }
}

