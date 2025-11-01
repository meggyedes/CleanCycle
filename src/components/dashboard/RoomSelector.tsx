'use client'

import { useState } from 'react'
import { Database } from '@/types/database.types'

type Room = Database['public']['Tables']['rooms']['Row']

interface RoomSelectorProps {
  rooms: Room[]
}

export default function RoomSelector({ rooms }: RoomSelectorProps) {
  const [selectedRoom, setSelectedRoom] = useState<number>(rooms[0]?.id || 1)

  return (
    <div className="mb-8">
      <div className="flex gap-4 justify-center flex-wrap">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => setSelectedRoom(room.id)}
            className={`px-8 py-4 rounded shadow-lg font-bold transition duration-200 uppercase text-sm tracking-wide ${
              selectedRoom === room.id
                ? 'bg-teal-500 text-white scale-105'
                : 'bg-white text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="text-lg">{room.name}</div>
            {room.description && (
              <div className="text-sm opacity-80 mt-1 normal-case tracking-normal font-normal">{room.description}</div>
            )}
          </button>
        ))}
      </div>

      {/* Hidden input to pass selected room to child components */}
      <input type="hidden" id="selected-room" value={selectedRoom} />
    </div>
  )
}

