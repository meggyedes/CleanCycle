'use client'

import { useEffect, useState, useCallback } from 'react'
import { userService } from '@/services/userService'
import { Database } from '@/types/database.types'

type User = Database['public']['Tables']['users']['Row']
type UserPreferences = Database['public']['Tables']['user_preferences']['Row']

export function useUserProfile(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await userService.getUserProfile(userId)
      setUser(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user profile'))
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchUser()
    }
  }, [userId, fetchUser])

  return {
    user,
    loading,
    error,
    refetch: fetchUser
  }
}

export function useUserPreferences(userId: string) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await userService.getUserPreferences(userId)
      setPreferences(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch preferences'))
    } finally {
      setLoading(false)
    }
  }, [userId])

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    try {
      const data = await userService.updateUserPreferences(userId, updates)
      setPreferences(data)
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update preferences')
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchPreferences()
    }
  }, [userId, fetchPreferences])

  return {
    preferences,
    loading,
    error,
    refetch: fetchPreferences,
    updatePreferences
  }
}

export function useUserStatistics(userId: string) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await userService.getUserStatistics(userId)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch statistics'))
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchStats()
      const interval = setInterval(fetchStats, 60000)
      return () => clearInterval(interval)
    }
  }, [userId, fetchStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}

export function useUserActivityLogs(userId: string, limit = 50) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await userService.getUserActivityLogs(userId, limit)
      setLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch activity logs'))
    } finally {
      setLoading(false)
    }
  }, [userId, limit])

  useEffect(() => {
    if (userId) {
      fetchLogs()
    }
  }, [userId, fetchLogs])

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs
  }
}

