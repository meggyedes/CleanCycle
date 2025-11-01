'use client'

import { useState, useEffect } from 'react'
import { useUserReservations } from '@/hooks/useReservations'
import { reservationService } from '@/services/reservationService'
import { Database } from '@/types/database.types'

type Machine = Database['public']['Tables']['machines']['Row']

interface ReservationCalendarProps {
  userId: string
  machines: Machine[]
}

export default function ReservationCalendar({ userId, machines }: ReservationCalendarProps) {
  const { reservations, loading, refetch } = useUserReservations(userId)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedMachine, setSelectedMachine] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    startTime: '09:00',
    endTime: '10:00',
    notes: ''
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
    setSelectedDate(newDate)
  }

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMachine) {
      setMessage({ type: 'error', text: 'Please select a machine' })
      return
    }

    setSubmitting(true)
    try {
      const startTime = new Date(selectedDate)
      const [startHour, startMin] = formData.startTime.split(':')
      startTime.setHours(parseInt(startHour), parseInt(startMin))

      const endTime = new Date(selectedDate)
      const [endHour, endMin] = formData.endTime.split(':')
      endTime.setHours(parseInt(endHour), parseInt(endMin))

      if (endTime <= startTime) {
        setMessage({ type: 'error', text: 'End time must be after start time' })
        return
      }

      await reservationService.createReservation(
        userId,
        selectedMachine,
        startTime,
        endTime,
        formData.notes
      )

      setMessage({ type: 'success', text: 'Reservation created successfully!' })
      setShowForm(false)
      setFormData({ startTime: '09:00', endTime: '10:00', notes: '' })
      setSelectedMachine(null)
      await refetch()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create reservation' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelReservation = async (reservationId: number) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return

    try {
      await reservationService.cancelReservation(reservationId)
      setMessage({ type: 'success', text: 'Reservation cancelled' })
      await refetch()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to cancel reservation' })
    }
  }

  const daysInMonth = getDaysInMonth(selectedDate)
  const firstDay = getFirstDayOfMonth(selectedDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const dayReservations = reservations.filter(r => {
    const resDate = new Date(r.start_time)
    return resDate.toDateString() === selectedDate.toDateString()
  })

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} className="px-3 py-1 bg-gray-200 rounded">←</button>
            <h3 className="text-xl font-bold">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={handleNextMonth} className="px-3 py-1 bg-gray-200 rounded">→</button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-bold text-gray-600">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}
            {days.map(day => {
              const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
              const isSelected = date.toDateString() === selectedDate.toDateString()
              const hasReservations = reservations.some(r =>
                new Date(r.start_time).toDateString() === date.toDateString()
              )

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square rounded flex items-center justify-center font-bold ${
                    isSelected
                      ? 'bg-teal-500 text-white'
                      : hasReservations
                      ? 'bg-yellow-100 text-yellow-900'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        {/* Reservations for Selected Date */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h3>

          {dayReservations.length > 0 ? (
            <div className="space-y-3">
              {dayReservations.map(res => (
                <div key={res.id} className="border rounded p-3 bg-gray-50">
                  <div className="font-semibold">{res.machines?.name}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(res.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} -
                    {new Date(res.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Status: {res.status}</div>
                  {res.status === 'pending' && (
                    <button
                      onClick={() => handleCancelReservation(res.id)}
                      className="text-xs text-red-600 hover:text-red-800 mt-2"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 mb-4">No reservations for this date</p>
          )}

          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            {showForm ? 'Cancel' : 'New Reservation'}
          </button>

          {showForm && (
            <form onSubmit={handleReservationSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Machine</label>
                <select
                  value={selectedMachine || ''}
                  onChange={(e) => setSelectedMachine(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select a machine</option>
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Reservation'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

