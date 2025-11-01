import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type User = Database['public']['Tables']['users']['Row']
type UserPreferences = Database['public']['Tables']['user_preferences']['Row']

export const userService = {
  /**
   * Get user profile
   */
  async getUserProfile(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      // If user doesn't exist, create one
      if (error.code === 'PGRST116') {
        const { data: authUser } = await supabase.auth.getUser()
        if (authUser?.user?.email) {
          return this.createUserProfile(userId, authUser.user.email)
        }
      }
      throw error
    }
    return data as User
  },

  /**
   * Create user profile
   */
  async createUserProfile(userId: string, email: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        name: null,
        phone: null,
        apartment_number: null,
        role: 'user'
      })
      .select()
      .single()

    if (error) throw error
    return data as User
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<User>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        profile_updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data as User
  },

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If preferences don't exist, create default ones
      if (error.code === 'PGRST116') {
        return this.createUserPreferences(userId)
      }
      throw error
    }
    return data as UserPreferences
  },

  /**
   * Create user preferences
   */
  async createUserPreferences(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        language: 'en',
        email_notifications: true,
        push_notifications: true,
        in_app_notifications: true,
        notification_reminder_minutes: 15
      })
      .select()
      .single()

    if (error) throw error
    return data as UserPreferences
  },

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string, updates: Partial<UserPreferences>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data as UserPreferences
  },

  /**
   * Get user statistics
   */
  async getUserStatistics(userId: string) {
    const supabase = createClient()
    
    // Get total sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, start_time, end_time, machine_id')
      .eq('user_id', userId)
      .eq('status', 'finished')

    if (sessionsError) throw sessionsError

    // Get total cost (assuming cost calculation)
    const totalSessions = sessions?.length || 0
    const totalMinutes = sessions?.reduce((acc, session) => {
      const start = new Date(session.start_time).getTime()
      const end = new Date(session.end_time).getTime()
      return acc + (end - start) / 60000
    }, 0) || 0

    // Get this month's sessions
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthSessions = sessions?.filter(s => 
      new Date(s.start_time) >= monthStart
    ).length || 0

    return {
      totalSessions,
      totalMinutes,
      thisMonthSessions,
      averageSessionDuration: totalSessions > 0 ? totalMinutes / totalSessions : 0
    }
  },

  /**
   * Get user activity logs
   */
  async getUserActivityLogs(userId: string, limit = 50) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as any[]
  },

  /**
   * Change password
   */
  async changePassword(newPassword: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
  },

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) throw error
    return data as User
  }
}

