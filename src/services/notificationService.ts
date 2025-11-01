import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Notification = Database['public']['Tables']['notifications']['Row']
type NotificationLog = Database['public']['Tables']['notification_logs']['Row']
type NotificationChannel = Database['public']['Tables']['notification_logs']['Row']['channel']

export const notificationService = {
  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit = 50) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as Notification[]
  },

  /**
   * Get notification logs
   */
  async getNotificationLogs(userId: string, limit = 50) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notification_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as NotificationLog[]
  },

  /**
   * Create notification
   */
  async createNotification(
    userId: string,
    type: string,
    message: string
  ) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: type as any,
        message
      })
      .select()
      .single()

    if (error) throw error
    return data as Notification
  },

  /**
   * Log notification delivery
   */
  async logNotificationDelivery(
    userId: string,
    channel: NotificationChannel,
    message: string,
    notificationId?: number
  ) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notification_logs')
      .insert({
        user_id: userId,
        notification_id: notificationId || null,
        channel,
        message,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data as NotificationLog
  },

  /**
   * Mark notification as sent
   */
  async markNotificationAsSent(logId: number) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notification_logs')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', logId)
      .select()
      .single()

    if (error) throw error
    return data as NotificationLog
  },

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(logId: number) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notification_logs')
      .update({
        status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('id', logId)
      .select()
      .single()

    if (error) throw error
    return data as NotificationLog
  },

  /**
   * Mark notification as failed
   */
  async markNotificationAsFailed(logId: number, errorMessage: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notification_logs')
      .update({
        status: 'failed',
        error_message: errorMessage
      })
      .eq('id', logId)
      .select()
      .single()

    if (error) throw error
    return data as NotificationLog
  },

  /**
   * Send wash completion notification
   */
  async sendWashCompletionNotification(userId: string, machineId: number) {
    const message = `Your wash has finished! Machine ${machineId} is ready.`
    const notification = await this.createNotification(userId, 'system', message)
    
    // Log for all enabled channels
    const userPrefs = await (await import('./userService')).userService.getUserPreferences(userId)
    
    if (userPrefs.email_notifications) {
      await this.logNotificationDelivery(userId, 'email', message, notification.id)
    }
    if (userPrefs.push_notifications) {
      await this.logNotificationDelivery(userId, 'push', message, notification.id)
    }
    if (userPrefs.in_app_notifications) {
      await this.logNotificationDelivery(userId, 'in_app', message, notification.id)
    }

    return notification
  },

  /**
   * Send reservation reminder notification
   */
  async sendReservationReminderNotification(userId: string, machineId: number, minutesUntil: number) {
    const message = `Your reservation starts in ${minutesUntil} minutes! Machine ${machineId}`
    const notification = await this.createNotification(userId, 'reminder', message)
    
    const userPrefs = await (await import('./userService')).userService.getUserPreferences(userId)
    
    if (userPrefs.email_notifications) {
      await this.logNotificationDelivery(userId, 'email', message, notification.id)
    }
    if (userPrefs.push_notifications) {
      await this.logNotificationDelivery(userId, 'push', message, notification.id)
    }
    if (userPrefs.in_app_notifications) {
      await this.logNotificationDelivery(userId, 'in_app', message, notification.id)
    }

    return notification
  },

  /**
   * Send machine error notification
   */
  async sendMachineErrorNotification(machineId: number, errorMessage: string) {
    const message = `Machine ${machineId} has an error: ${errorMessage}`
    
    // Get all users and notify them
    const supabase = createClient()
    const { data: users } = await supabase
      .from('users')
      .select('id')

    if (users) {
      for (const user of users) {
        const notification = await this.createNotification(user.id, 'system', message)
        const userPrefs = await (await import('./userService')).userService.getUserPreferences(user.id)
        
        if (userPrefs.in_app_notifications) {
          await this.logNotificationDelivery(user.id, 'in_app', message, notification.id)
        }
      }
    }
  }
}

