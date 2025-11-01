'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useInAppNotifications } from '@/hooks/useNotifications'

interface NotificationCenterProps {
  userId: string
}

export default function NotificationCenter({ userId }: NotificationCenterProps) {
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  const { notifications, unreadCount, dismissNotification } = useInAppNotifications(userId)
  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return '📧'
      case 'push':
        return '🔔'
      case 'in_app':
        return 'ℹ️'
      default:
        return '📬'
    }
  }

  const getNotificationColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-50 border-blue-200'
      case 'sent':
        return 'bg-green-50 border-green-200'
      case 'failed':
        return 'bg-red-50 border-red-200'
      case 'read':
        return 'bg-gray-50 border-gray-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="text-lg font-bold">{t('notifications')}</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600">{unreadCount} {t('unread')}</p>
            )}
          </div>

          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 border-teal-500 ${getNotificationColor(notification.status)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getNotificationIcon(notification.channel)}</span>
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          {notification.channel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 mt-2">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>{t('noNotifications')}</p>
            </div>
          )}

          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

