'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const t = useTranslations('auth')

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab)
    setError('')
    setSuccess('')
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card Container with Shadow and Animation */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
        
        {/* Tab Header */}
        <div className="relative flex bg-gray-50">
          {/* Sliding Background Indicator */}
          <div
            className={`absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-teal-500 to-teal-600 transition-transform duration-500 ease-in-out ${
              activeTab === 'register' ? 'translate-x-full' : 'translate-x-0'
            }`}
          />
          
          {/* Login Tab */}
          <button
            onClick={() => handleTabChange('login')}
            className={`relative z-10 flex-1 py-4 px-6 font-bold text-center transition-all duration-300 ${
              activeTab === 'login'
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {t('login.title')}
          </button>
          
          {/* Register Tab */}
          <button
            onClick={() => handleTabChange('register')}
            className={`relative z-10 flex-1 py-4 px-6 font-bold text-center transition-all duration-300 ${
              activeTab === 'register'
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {t('register.title')}
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-slideDown">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mx-6 mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg animate-slideDown">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Form Content with Sliding Animation */}
        <div className="relative overflow-hidden">
          <div
            className={`flex transition-transform duration-500 ease-in-out ${
              activeTab === 'register' ? '-translate-x-full' : 'translate-x-0'
            }`}
          >
            {/* Login Form */}
            <div className="w-full flex-shrink-0 p-8">
              <LoginForm
                loading={loading}
                setLoading={setLoading}
                setError={setError}
                setSuccess={setSuccess}
                router={router}
              />
            </div>

            {/* Register Form */}
            <div className="w-full flex-shrink-0 p-8">
              <RegisterForm
                loading={loading}
                setLoading={setLoading}
                setError={setError}
                setSuccess={setSuccess}
                onSuccess={() => {
                  setSuccess(t('register.success'))
                  setTimeout(() => {
                    setActiveTab('login')
                  }, 2000)
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center">
          <p className="text-xs text-gray-500 border-t border-gray-200 pt-6">
            Powered by Daniel Soos 2025
          </p>
        </div>
      </div>
    </div>
  )
}

