'use client'

import { useEffect, useState, useCallback } from 'react'
import { machineService } from '@/services/machineService'
import { Database } from '@/types/database.types'

type Machine = Database['public']['Tables']['machines']['Row']

interface UseMachinesOptions {
  roomId?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useMachines(options: UseMachinesOptions = {}) {
  const {
    roomId,
    autoRefresh = true,
    refreshInterval = 5000
  } = options

  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMachines = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let data: Machine[]
      if (roomId) {
        data = await machineService.getMachinesByRoom(roomId)
      } else {
        data = await machineService.getAllMachines()
      }

      setMachines(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch machines'))
    } finally {
      setLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    fetchMachines()

    if (autoRefresh) {
      const interval = setInterval(fetchMachines, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchMachines, autoRefresh, refreshInterval])

  return {
    machines,
    loading,
    error,
    refetch: fetchMachines
  }
}

export function useMachine(machineId: number) {
  const [machine, setMachine] = useState<Machine | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMachine = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await machineService.getMachineById(machineId)
      setMachine(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch machine'))
    } finally {
      setLoading(false)
    }
  }, [machineId])

  useEffect(() => {
    fetchMachine()
    const interval = setInterval(fetchMachine, 5000)
    return () => clearInterval(interval)
  }, [fetchMachine])

  return {
    machine,
    loading,
    error,
    refetch: fetchMachine
  }
}

