'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/types/database.types'
import StartMachineModal from './StartMachineModal'

type Machine = Database['public']['Tables']['machines']['Row']
type Session = Database['public']['Tables']['sessions']['Row']

interface MachineWithSession extends Machine {
  currentSession?: Session | null
}

interface MachineCardProps {
  machine: MachineWithSession
  onUpdate: () => void
}

export default function MachineCard({ machine, onUpdate }: MachineCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  useEffect(() => {
    if (machine.currentSession && machine.status === 'running') {
      const interval = setInterval(() => {
        const now = new Date()
        const endTime = new Date(machine.currentSession!.end_time)
        const diff = endTime.getTime() - now.getTime()

        if (diff <= 0) {
          setTimeRemaining('Lejárt!')
          onUpdate()
        } else {
          const minutes = Math.floor(diff / 60000)
          const seconds = Math.floor((diff % 60000) / 1000)
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [machine.currentSession, machine.status])

  const getStatusColor = () => {
    switch (machine.status) {
      case 'free':
        return 'bg-green-500'
      case 'running':
        return 'bg-red-500'
      case 'booked':
        return 'bg-yellow-500'
      case 'maintenance':
        return 'bg-gray-500'
      case 'broken':
        return 'bg-black'
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusText = () => {
    switch (machine.status) {
      case 'free':
        return 'Szabad'
      case 'running':
        return 'Fut'
      case 'booked':
        return 'Foglalt'
      case 'maintenance':
        return 'Karbantartás'
      case 'broken':
        return 'Hibás'
      default:
        return 'Ismeretlen'
    }
  }

  const getStatusIcon = () => {
    switch (machine.status) {
      case 'free':
        return '✓'
      case 'running':
        return '⏱️'
      case 'booked':
        return '📅'
      case 'maintenance':
        return '🔧'
      case 'broken':
        return '⚠️'
      default:
        return '?'
    }
  }

  return (
    <>
      <div className={`rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
        machine.status === 'free' ? 'hover:scale-105' : ''
      }`}>
        {/* Status Bar */}
        <div className={`${getStatusColor()} h-2`}></div>

        {/* Card Content */}
        <div className="bg-white dark:bg-gray-800 p-6">
          {/* Machine Name */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {machine.name}
            </h3>
            <span className="text-3xl">{getStatusIcon()}</span>
          </div>

          {/* Status */}
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Time Remaining */}
          {machine.status === 'running' && timeRemaining && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hátralévő idő:</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {timeRemaining}
              </p>
            </div>
          )}

          {/* Default Duration */}
          {machine.status === 'free' && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Alapértelmezett idő: {machine.default_duration} perc
              </p>
            </div>
          )}

          {/* Action Button */}
          {machine.status === 'free' && (
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded shadow-lg transition duration-200 uppercase text-sm tracking-wide"
            >
              Indítás
            </button>
          )}

          {machine.status === 'running' && machine.currentSession && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Indítva: {new Date(machine.currentSession.start_time).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}</p>
              <p>Várható vége: {new Date(machine.currentSession.end_time).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          )}
        </div>
      </div>

      {/* Start Machine Modal */}
      {showModal && (
        <StartMachineModal
          machine={machine}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            onUpdate()
          }}
        />
      )}
    </>
  )
}

