'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Machine = Database['public']['Tables']['machines']['Row']
type MachineStatus = Database['public']['Tables']['machines']['Row']['status']

export default function AdminMachineManager() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchMachines()
  }, [])

  const fetchMachines = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('machines')
      .select('*, rooms(name)')
      .order('room_id')
      .order('name')

    if (data) {
      setMachines(data as any)
    }
    setLoading(false)
  }

  const updateMachineStatus = async (machineId: number, newStatus: MachineStatus) => {
    const { error } = await supabase
      .from('machines')
      .update({ status: newStatus })
      .eq('id', machineId)

    if (error) {
      alert('Hiba történt: ' + error.message)
    } else {
      // If setting to free, also finish any active sessions
      if (newStatus === 'free') {
        await supabase
          .from('sessions')
          .update({
            status: 'finished',
            actual_end: new Date().toISOString()
          })
          .eq('machine_id', machineId)
          .eq('status', 'active')
      }
      fetchMachines()
    }
  }

  const statusOptions: MachineStatus[] = ['free', 'running', 'booked', 'maintenance', 'broken']
  
  const statusLabels: Record<MachineStatus, string> = {
    free: 'Szabad',
    running: 'Fut',
    booked: 'Foglalt',
    maintenance: 'Karbantartás',
    broken: 'Hibás'
  }

  const statusColors: Record<MachineStatus, string> = {
    free: 'bg-green-500',
    running: 'bg-red-500',
    booked: 'bg-yellow-500',
    maintenance: 'bg-gray-500',
    broken: 'bg-black'
  }

  if (loading) {
    return <div className="text-center py-8">Betöltés...</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Gép
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Szoba
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Típus
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Állapot
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Műveletek
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {machines.map((machine) => (
            <tr key={machine.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {machine.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {(machine as any).rooms?.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {machine.type === 'washer' ? '🌊 Mosó' : '🌪️ Szárító'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${statusColors[machine.status as MachineStatus]}`}>
                  {statusLabels[machine.status as MachineStatus]}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <select
                  value={machine.status}
                  onChange={(e) => updateMachineStatus(machine.id, e.target.value as MachineStatus)}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

