'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useUserProfile, useUserPreferences } from '@/hooks/useUser'
import { userService } from '@/services/userService'

interface UserProfileProps {
  userId: string
}

export default function UserProfile({ userId }: UserProfileProps) {
  const t = useTranslations('common')
  const { user, loading: userLoading, refetch: refetchUser } = useUserProfile(userId)
  const { preferences, loading: prefsLoading, updatePreferences } = useUserPreferences(userId)

  const [editMode, setEditMode] = useState(false)
  const [passwordMode, setPasswordMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    apartment_number: ''
  })

  // Update formData when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        apartment_number: user.apartment_number || ''
      })
    }
  }, [user])
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await userService.updateUserProfile(userId, {
        name: formData.name,
        phone: formData.phone,
        apartment_number: formData.apartment_number
      } as any)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setEditMode(false)
      await refetchUser()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setLoading(true)
    try {
      await userService.changePassword(passwordData.newPassword)
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordMode(false)
      setPasswordData({ newPassword: '', confirmPassword: '' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' })
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesChange = async (key: string, value: any) => {
    try {
      await updatePreferences({ [key]: value } as any)
      setMessage({ type: 'success', text: 'Preferences updated!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update preferences' })
    }
  }

  if (userLoading || prefsLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Messages */}
      {message && (
        <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Personal Information</h2>
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editMode ? (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border rounded bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Apartment Number</label>
              <input
                type="text"
                name="apartment_number"
                value={formData.apartment_number}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <div><strong>Name:</strong> {user?.name || 'Not set'}</div>
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>Phone:</strong> {user?.phone || 'Not set'}</div>
            <div><strong>Apartment:</strong> {user?.apartment_number || 'Not set'}</div>
          </div>
        )}
      </div>

      {/* Preferences Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences?.email_notifications || false}
              onChange={(e) => handlePreferencesChange('email_notifications', e.target.checked)}
              className="mr-3"
            />
            <span>Email Notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences?.push_notifications || false}
              onChange={(e) => handlePreferencesChange('push_notifications', e.target.checked)}
              className="mr-3"
            />
            <span>Push Notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences?.in_app_notifications || false}
              onChange={(e) => handlePreferencesChange('in_app_notifications', e.target.checked)}
              className="mr-3"
            />
            <span>In-App Notifications</span>
          </label>
          <div>
            <label className="block text-sm font-medium mb-1">Reminder Time (minutes before)</label>
            <input
              type="number"
              value={preferences?.notification_reminder_minutes || 15}
              onChange={(e) => handlePreferencesChange('notification_reminder_minutes', parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded"
              min="5"
              max="60"
            />
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Security</h2>
          <button
            onClick={() => setPasswordMode(!passwordMode)}
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            {passwordMode ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {passwordMode && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

