'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Machine = Database['public']['Tables']['machines']['Row']

interface StartMachineModalProps {
  machine: Machine
  onClose: () => void
  onSuccess: () => void
}

export default function StartMachineModal({ machine, onClose, onSuccess }: StartMachineModalProps) {
  const [duration, setDuration] = useState(machine.default_duration)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleStart = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Nincs bejelentkezve')
        setLoading(false)
        return
      }

      const now = new Date()
      const endTime = new Date(now.getTime() + duration * 60000)

      // Create session
      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          machine_id: machine.id,
          start_time: now.toISOString(),
          end_time: endTime.toISOString(),
          status: 'active'
        })

      if (sessionError) throw sessionError

      // Update machine status
      const { error: machineError } = await supabase
        .from('machines')
        .update({ status: 'running' })
        .eq('id', machine.id)

      if (machineError) throw machineError

      // Log the action
      await supabase
        .from('logs')
        .insert({
          user_id: user.id,
          machine_id: machine.id,
          action: 'machine_started',
          details: {
            duration: duration,
            end_time: endTime.toISOString()
          }
        })

      onSuccess()
    } catch (err: any) {
      console.error('Error starting machine:', err)
      setError(err.message || 'Hiba történt a gép indítása során')
    } finally {
      setLoading(false)
    }
  }

  const presetDurations = [30, 45, 60, 90, 120]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          {machine.name} indítása
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Időtartam (perc)
          </label>
          
          {/* Preset buttons */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {presetDurations.map(preset => (
              <button
                key={preset}
                onClick={() => setDuration(preset)}
                className={`py-2 px-3 rounded shadow font-bold transition duration-200 ${
                  duration === preset
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Custom duration input */}
          <input
            type="number"
            min="1"
            max="240"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || machine.default_duration)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Várható befejezés:</strong>
            <br />
            {new Date(Date.now() + duration * 60000).toLocaleString('hu-HU', {
              hour: '2-digit',
              minute: '2-digit',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded shadow transition duration-200 disabled:opacity-50 uppercase text-sm tracking-wide"
          >
            Mégse
          </button>
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded shadow-lg transition duration-200 disabled:opacity-50 flex items-center justify-center uppercase text-sm tracking-wide"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Indítás...
              </>
            ) : (
              'Indítás'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

