'use client'

import { useEffect, useState, useCallback } from 'react'
import { reservationService } from '@/services/reservationService'
import { Database } from '@/types/database.types'

type Reservation = Database['public']['Tables']['reservations']['Row']

export function useUserReservations(userId: string) {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await reservationService.getUserReservations(userId)
      setReservations(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch reservations'))
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchReservations()
      const interval = setInterval(fetchReservations, 10000)
      return () => clearInterval(interval)
    }
  }, [userId, fetchReservations])

  return {
    reservations,
    loading,
    error,
    refetch: fetchReservations
  }
}

export function useUpcomingReservations(userId: string, hoursAhead = 24) {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await reservationService.getUpcomingReservations(userId, hoursAhead)
      setReservations(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch upcoming reservations'))
    } finally {
      setLoading(false)
    }
  }, [userId, hoursAhead])

  useEffect(() => {
    if (userId) {
      fetchReservations()
      const interval = setInterval(fetchReservations, 30000)
      return () => clearInterval(interval)
    }
  }, [userId, fetchReservations])

  return {
    reservations,
    loading,
    error,
    refetch: fetchReservations
  }
}

export function useMachineReservations(machineId: number, startTime: Date, endTime: Date) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await reservationService.getMachineReservations(machineId, startTime, endTime)
      setReservations(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch machine reservations'))
    } finally {
      setLoading(false)
    }
  }, [machineId, startTime, endTime])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  return {
    reservations,
    loading,
    error,
    refetch: fetchReservations
  }
}

