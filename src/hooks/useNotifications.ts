'use client'

import { useEffect, useState, useCallback } from 'react'
import { notificationService } from '@/services/notificationService'
import { Database } from '@/types/database.types'

type Notification = Database['public']['Tables']['notifications']['Row']
type NotificationLog = Database['public']['Tables']['notification_logs']['Row']

export function useNotifications(userId: string, limit = 50) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await notificationService.getUserNotifications(userId, limit)
      setNotifications(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'))
    } finally {
      setLoading(false)
    }
  }, [userId, limit])

  useEffect(() => {
    if (userId) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 10000)
      return () => clearInterval(interval)
    }
  }, [userId, fetchNotifications])

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications
  }
}

export function useNotificationLogs(userId: string, limit = 50) {
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await notificationService.getNotificationLogs(userId, limit)
      setLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notification logs'))
    } finally {
      setLoading(false)
    }
  }, [userId, limit])

  const markAsRead = useCallback(async (logId: number) => {
    try {
      await notificationService.markNotificationAsRead(logId)
      await fetchLogs()
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to mark as read')
    }
  }, [fetchLogs])

  useEffect(() => {
    if (userId) {
      fetchLogs()
      const interval = setInterval(fetchLogs, 15000)
      return () => clearInterval(interval)
    }
  }, [userId, fetchLogs])

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
    markAsRead
  }
}

export function useInAppNotifications(userId: string) {
  const [inAppNotifications, setInAppNotifications] = useState<NotificationLog[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const { logs, refetch } = useNotificationLogs(userId, 100)

  useEffect(() => {
    const inApp = logs.filter(log => log.channel === 'in_app' && log.status !== 'read')
    setInAppNotifications(inApp)
    setUnreadCount(inApp.length)
  }, [logs])

  const dismissNotification = useCallback(async (logId: number) => {
    try {
      await notificationService.markNotificationAsRead(logId)
      setInAppNotifications(prev => prev.filter(n => n.id !== logId))
      setUnreadCount(prev => Math.max(0, prev - 1))
      await refetch()
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to dismiss notification')
    }
  }, [refetch])

  return {
    notifications: inAppNotifications,
    unreadCount,
    dismissNotification,
    refetch
  }
}

