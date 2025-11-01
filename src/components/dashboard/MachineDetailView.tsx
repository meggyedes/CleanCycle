'use client'

import { useState, useEffect } from 'react'
import { useMachine } from '@/hooks/useMachines'
import { machineService } from '@/services/machineService'
import { Database } from '@/types/database.types'

type MachineError = Database['public']['Tables']['machine_errors']['Row']
type MaintenanceHistory = Database['public']['Tables']['maintenance_history']['Row']

interface MachineDetailViewProps {
  machineId: number
}

export default function MachineDetailView({ machineId }: MachineDetailViewProps) {
  const { machine, loading, refetch } = useMachine(machineId)
  const [errors, setErrors] = useState<MachineError[]>([])
  const [maintenance, setMaintenance] = useState<MaintenanceHistory[]>([])
  const [loadingDetails, setLoadingDetails] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoadingDetails(true)
        const { errors: machineErrors } = await machineService.getMachineWithErrors(machineId)
        setErrors(machineErrors)

        const maintenanceHistory = await machineService.getMachineMaintenanceHistory(machineId)
        setMaintenance(maintenanceHistory)
      } catch (error) {
        console.error('Failed to fetch machine details:', error)
      } finally {
        setLoadingDetails(false)
      }
    }

    if (machineId) {
      fetchDetails()
    }
  }, [machineId])

  if (loading || loadingDetails) {
    return <div className="text-center py-8">Loading machine details...</div>
  }

  if (!machine) {
    return <div className="text-center py-8 text-red-600">Machine not found</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'free':
        return 'bg-green-100 text-green-800'
      case 'running':
        return 'bg-red-100 text-red-800'
      case 'booked':
        return 'bg-yellow-100 text-yellow-800'
      case 'maintenance':
        return 'bg-gray-100 text-gray-800'
      case 'broken':
        return 'bg-black text-white'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'bg-blue-100 text-blue-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Machine Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold">{machine.name}</h1>
            <p className="text-gray-600 mt-1">Machine ID: {machine.id}</p>
          </div>
          <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(machine.status)}`}>
            {machine.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-gray-600 text-sm">Type</div>
            <div className="text-lg font-semibold capitalize">{machine.type}</div>
          </div>
          <div>
            <div className="text-gray-600 text-sm">Default Duration</div>
            <div className="text-lg font-semibold">{machine.default_duration} min</div>
          </div>
          {machine.capacity_kg && (
            <div>
              <div className="text-gray-600 text-sm">Capacity</div>
              <div className="text-lg font-semibold">{machine.capacity_kg} kg</div>
            </div>
          )}
          <div>
            <div className="text-gray-600 text-sm">Created</div>
            <div className="text-lg font-semibold">
              {new Date(machine.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Current Errors */}
      {errors.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Active Errors</h2>
          <div className="space-y-3">
            {errors.map(error => (
              <div key={error.id} className={`p-4 rounded ${getSeverityColor(error.severity)}`}>
                <div className="font-semibold">{error.error_code}</div>
                <div className="text-sm mt-1">{error.error_message}</div>
                <div className="text-xs mt-2">
                  Reported: {new Date(error.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maintenance History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Maintenance History</h2>
        {maintenance.length > 0 ? (
          <div className="space-y-3">
            {maintenance.map(record => (
              <div key={record.id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold capitalize">{record.maintenance_type}</div>
                    <div className="text-sm text-gray-600 mt-1">{record.description}</div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {new Date(record.start_time).toLocaleDateString()}
                  </div>
                </div>
                {record.end_time && (
                  <div className="text-xs text-gray-500 mt-2">
                    Duration: {Math.round((new Date(record.end_time).getTime() - new Date(record.start_time).getTime()) / 60000)} minutes
                  </div>
                )}
                {record.notes && (
                  <div className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                    {record.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No maintenance records</p>
        )}
      </div>

      {/* Last Maintenance */}
      {machine.last_maintenance && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Last Maintenance</div>
          <div className="text-lg font-semibold">
            {new Date(machine.last_maintenance).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={refetch}
        className="w-full px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
      >
        Refresh Details
      </button>
    </div>
  )
}

