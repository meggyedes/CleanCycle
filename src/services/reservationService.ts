import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Reservation = Database['public']['Tables']['reservations']['Row']
type ReservationStatus = Database['public']['Tables']['reservations']['Row']['status']

export const reservationService = {
  /**
   * Get user's reservations
   */
  async getUserReservations(userId: string, status?: ReservationStatus) {
    const supabase = createClient()
    
    let query = supabase
      .from('reservations')
      .select(`
        *,
        machines:machine_id(*)
      `)
      .eq('user_id', userId)
      .order('start_time', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return data as any[]
  },

  /**
   * Get all reservations (admin only)
   */
  async getAllReservations(status?: ReservationStatus) {
    const supabase = createClient()
    
    let query = supabase
      .from('reservations')
      .select(`
        *,
        users:user_id(id, email, name),
        machines:machine_id(*)
      `)
      .order('start_time', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return data as any[]
  },

  /**
   * Create reservation
   */
  async createReservation(
    userId: string,
    machineId: number,
    startTime: Date,
    endTime: Date,
    notes?: string
  ) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        user_id: userId,
        machine_id: machineId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'pending',
        notes
      })
      .select()
      .single()

    if (error) throw error
    return data as Reservation
  },

  /**
   * Update reservation
   */
  async updateReservation(
    reservationId: number,
    updates: Partial<Reservation>
  ) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('reservations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', reservationId)
      .select()
      .single()

    if (error) throw error
    return data as Reservation
  },

  /**
   * Cancel reservation
   */
  async cancelReservation(reservationId: number) {
    return this.updateReservation(reservationId, {
      status: 'cancelled'
    })
  },

  /**
   * Confirm reservation
   */
  async confirmReservation(reservationId: number) {
    return this.updateReservation(reservationId, {
      status: 'confirmed'
    })
  },

  /**
   * Complete reservation
   */
  async completeReservation(reservationId: number) {
    return this.updateReservation(reservationId, {
      status: 'completed'
    })
  },

  /**
   * Get reservations for machine in time range
   */
  async getMachineReservations(
    machineId: number,
    startTime: Date,
    endTime: Date
  ) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('machine_id', machineId)
      .eq('status', 'confirmed')
      .gte('start_time', startTime.toISOString())
      .lte('end_time', endTime.toISOString())
      .order('start_time')

    if (error) throw error
    return data as Reservation[]
  },

  /**
   * Check if machine is available for time slot
   */
  async isMachineAvailable(
    machineId: number,
    startTime: Date,
    endTime: Date
  ) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('reservations')
      .select('id')
      .eq('machine_id', machineId)
      .eq('status', 'confirmed')
      .or(`and(start_time.lt.${endTime.toISOString()},end_time.gt.${startTime.toISOString()})`)
      .limit(1)

    if (error) throw error
    return (data as any[]).length === 0
  },

  /**
   * Get upcoming reservations for user
   */
  async getUpcomingReservations(userId: string, hoursAhead = 24) {
    const supabase = createClient()
    const now = new Date()
    const future = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        machines:machine_id(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .gte('start_time', now.toISOString())
      .lte('start_time', future.toISOString())
      .order('start_time')

    if (error) throw error
    return data as any[]
  }
}

