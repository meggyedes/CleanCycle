'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MachineType, MachineStatus } from '@/types/database.types'

interface Machine {
  id: number
  room_id: number
  name: string
  type: MachineType
  status: MachineStatus
  default_duration: number
  created_at: string
}

interface Room {
  id: number
  name: string
  description: string | null
}

export default function MachinesList() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'washer' | 'dryer'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | MachineStatus>('all')
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch machines
      const { data: machinesData, error: machinesError } = await supabase
        .from('machines')
        .select('*')
        .order('room_id', { ascending: true })

      if (machinesError) throw machinesError

      // Fetch rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('name', { ascending: true })

      if (roomsError) throw roomsError

      setMachines(machinesData || [])
      setRooms(roomsData || [])
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message || 'Hiba történt az adatok betöltésekor')
    } finally {
      setLoading(false)
    }
  }

  const getRoomName = (roomId: number) => {
    return rooms.find(r => r.id === roomId)?.name || `Szoba ${roomId}`
  }

  const getStatusColor = (status: MachineStatus) => {
    switch (status) {
      case 'free':
        return 'bg-green-100 text-green-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'booked':
        return 'bg-yellow-100 text-yellow-800'
      case 'maintenance':
        return 'bg-orange-100 text-orange-800'
      case 'broken':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: MachineStatus) => {
    switch (status) {
      case 'free':
        return 'Szabad'
      case 'running':
        return 'Működik'
      case 'booked':
        return 'Foglalt'
      case 'maintenance':
        return 'Karbantartás'
      case 'broken':
        return 'Hibás'
      default:
        return status
    }
  }

  const getTypeLabel = (type: MachineType) => {
    return type === 'washer' ? 'Mosógép' : 'Szárítógép'
  }

  const filteredMachines = machines.filter(machine => {
    const typeMatch = filterType === 'all' || machine.type === filterType
    const statusMatch = filterStatus === 'all' || machine.status === filterStatus
    return typeMatch && statusMatch
  })

  const groupedByRoom = filteredMachines.reduce((acc, machine) => {
    const roomId = machine.room_id
    if (!acc[roomId]) {
      acc[roomId] = []
    }
    acc[roomId].push(machine)
    return acc
  }, {} as Record<number, Machine[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Szűrők */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Szűrők</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gép típusa
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">Összes</option>
              <option value="washer">Mosógépek</option>
              <option value="dryer">Szárítógépek</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Állapot
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">Összes</option>
              <option value="free">Szabad</option>
              <option value="running">Működik</option>
              <option value="booked">Foglalt</option>
              <option value="maintenance">Karbantartás</option>
              <option value="broken">Hibás</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Gépek listája szobák szerint */}
      {Object.entries(groupedByRoom).map(([roomId, roomMachines]) => (
        <div key={roomId} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">
              {getRoomName(parseInt(roomId))}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {roomMachines.map(machine => (
              <div
                key={machine.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{machine.name}</h4>
                    <p className="text-sm text-gray-600">
                      {getTypeLabel(machine.type)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(machine.status)}`}>
                    {getStatusLabel(machine.status)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>⏱️ Alapértelmezett: {machine.default_duration} perc</p>
                </div>
                {machine.status === 'free' && (
                  <button className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    Foglalás
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {filteredMachines.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg">Nincs megjeleníthető gép a kiválasztott szűrőkkel</p>
        </div>
      )}
    </div>
  )
}

