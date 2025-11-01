'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import MachineCard from './MachineCard'
import { Database } from '@/types/database.types'

type Machine = Database['public']['Tables']['machines']['Row']
type Session = Database['public']['Tables']['sessions']['Row']
type Room = Database['public']['Tables']['rooms']['Row']

interface MachineWithSession extends Machine {
  currentSession?: Session | null
}

interface MachineGridProps {
  rooms: Room[]
}

export default function MachineGrid({ rooms }: MachineGridProps) {
  const [machines, setMachines] = useState<MachineWithSession[]>([])
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  // Debug: log rooms
  useEffect(() => {
    console.log('MachineGrid received rooms:', rooms)
  }, [rooms])

  // Set initial room on mount
  useEffect(() => {
    if (rooms.length > 0 && selectedRoom === null) {
      console.log('Setting initial room:', rooms[0].id)
      setSelectedRoom(rooms[0].id)
    }
  }, [rooms, selectedRoom])

  useEffect(() => {
    if (selectedRoom !== null) {
      fetchMachines()

      // Auto-refresh every 5 seconds
      const interval = setInterval(() => {
        fetchMachines()
      }, 5000)

      return () => {
        clearInterval(interval)
      }
    }
  }, [selectedRoom])

  const fetchMachines = async () => {
    if (selectedRoom === null) return

    setLoading(true)

    try {
      // Fetch machines for selected room
      const { data: machinesData } = await supabase
        .from('machines')
        .select('*')
        .eq('room_id', selectedRoom)
        .order('type')
        .order('name')

      if (machinesData) {
        // Fetch active sessions for these machines
        const machineIds = machinesData.map(m => m.id)
        const { data: sessionsData } = await supabase
          .from('sessions')
          .select('*')
          .in('machine_id', machineIds)
          .eq('status', 'active')

        // Combine machines with their sessions
        const machinesWithSessions = machinesData.map(machine => ({
          ...machine,
          currentSession: sessionsData?.find(s => s.machine_id === machine.id) || null
        }))

        setMachines(machinesWithSessions)
      }
    } catch (error) {
      console.error('Failed to fetch machines:', error)
    } finally {
      setLoading(false)
    }
  }

  if (selectedRoom === null) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Nincs elérhető szoba</p>
      </div>
    )
  }

  const washers = machines.filter(m => m.type === 'washer')
  const dryers = machines.filter(m => m.type === 'dryer')
  const currentRoom = rooms.find(r => r.id === selectedRoom)

  return (
    <div className="space-y-8">
      {/* Room Selector */}
      <div className="flex gap-2 flex-wrap">
        {rooms.map(room => (
          <button
            key={room.id}
            onClick={() => setSelectedRoom(room.id)}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              selectedRoom === room.id
                ? 'bg-teal-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {room.name}
          </button>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-between items-center bg-teal-50 p-4 rounded shadow">
        <div className="text-sm text-gray-700">
          🔄 Automatikus frissítés 5 másodpercenként
        </div>
        <button
          onClick={fetchMachines}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded shadow-lg transition-colors font-bold uppercase text-sm tracking-wide disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Frissítés most
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="mt-2 text-gray-600">Betöltés...</p>
        </div>
      )}

      {/* Washers */}
      {washers.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            🌊 Mosógépek
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {washers.map(machine => (
              <MachineCard key={machine.id} machine={machine} onUpdate={fetchMachines} />
            ))}
          </div>
        </div>
      )}

      {/* Dryers */}
      {dryers.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            🌪️ Szárítógépek
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dryers.map(machine => (
              <MachineCard key={machine.id} machine={machine} onUpdate={fetchMachines} />
            ))}
          </div>
        </div>
      )}

      {/* No machines message */}
      {machines.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">Nincs gép ebben a szobában</p>
        </div>
      )}
    </div>
  )
}

