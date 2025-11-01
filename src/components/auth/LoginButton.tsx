'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PasswordStrengthIndicator from './PasswordStrengthIndicator'

export default function LoginButton() {
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Login fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Signup fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [apartmentNumber, setApartmentNumber] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showForm, setShowForm] = useState(true)
  const router = useRouter()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isSignUp) {
        // Validáció
        if (!firstName.trim() || !lastName.trim()) {
          throw new Error('Kérjük, add meg a vezeték- és keresztnevedet!')
        }
        if (!apartmentNumber.trim()) {
          throw new Error('Kérjük, add meg a lakás számát!')
        }
        if (signUpPassword !== confirmPassword) {
          throw new Error('A jelszavak nem egyeznek!')
        }
        if (signUpPassword.length < 8) {
          throw new Error('A jelszó legalább 8 karakter hosszú kell, hogy legyen!')
        }

        // Regisztráció API-n keresztül
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password: signUpPassword,
            firstName,
            lastName,
            apartmentNumber,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Regisztráció sikertelen')
        }

        setSuccess('Sikeres regisztráció! Most már bejelentkezhetsz.')
        setIsSignUp(false)
        setFirstName('')
        setLastName('')
        setApartmentNumber('')
        setSignUpPassword('')
        setConfirmPassword('')
        setEmail('')
      } else {
        // Bejelentkezés API-n keresztül
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            rememberMe,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Bejelentkezés sikertelen')
        }

        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setError(error.message || 'Hiba történt. Próbáld újra!')
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Arial, sans-serif', fontStyle: 'italic' }}>
            Laundry Management System
          </h1>
        </div>

        <button
          onClick={() => {
            setShowForm(true)
            setIsSignUp(false)
          }}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded shadow-lg transition-all duration-200 uppercase text-sm tracking-wide"
        >
          Bejelentkezés
        </button>

        <div className="border-t border-gray-300"></div>

        <button
          onClick={() => {
            setShowForm(true)
            setIsSignUp(true)
          }}
          className="w-full text-center text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors"
        >
          Nincs még fiókod? <span className="underline">Itt tudsz regisztrálni</span>
        </button>
      </div>
    )
  }

  // Form view - with tabs to switch between login and signup
  return (
    <div className="w-full">
      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 mb-8 border-b-2 border-gray-200">
        <button
          onClick={() => {
            setIsSignUp(false)
            setError('')
            setSuccess('')
          }}
          className={`flex-1 py-4 font-semibold text-center transition-all duration-300 relative ${
            !isSignUp
              ? 'text-teal-600'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Bejelentkezés
          {!isSignUp && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-600 rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => {
            setIsSignUp(true)
            setError('')
            setSuccess('')
          }}
          className={`flex-1 py-4 font-semibold text-center transition-all duration-300 relative ${
            isSignUp
              ? 'text-teal-600'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Regisztráció
          {isSignUp && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-600 rounded-t-full"></div>
          )}
        </button>
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-5">
        {/* REGISZTRÁCIÓ MEZŐK */}
        {isSignUp && (
          <div className="space-y-5 animate-fadeIn">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Vezetéknév *
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Soos"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-200"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Keresztnév *
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dániel"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="apartmentNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                Lakás szám *
              </label>
              <input
                id="apartmentNumber"
                type="text"
                value={apartmentNumber}
                onChange={(e) => setApartmentNumber(e.target.value)}
                placeholder="pl. K136"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* EMAIL MEZŐ */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email cím *
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="pelda@email.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-200"
          />
        </div>

        {/* JELSZÓ MEZŐK */}
        {isSignUp ? (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-3">
              <label htmlFor="signUpPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Jelszó *
              </label>
              <input
                id="signUpPassword"
                type="password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={8}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-200"
              />

              {/* Jelszó erősség indikátor */}
              <PasswordStrengthIndicator password={signUpPassword} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Jelszó megerősítése *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={8}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-5 00 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-200"
              />
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Jelszó *
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-200"
            />
          </div>
        )}

        {/* EMLÉKEZZ RÁM CHECKBOX - csak bejelentkezésnél */}
        {!isSignUp && (
          <div className="flex items-center gap-3">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-2 focus:ring-teal-500 cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-sm font-medium text-gray-700 cursor-pointer">
              Emlékezz rám
            </label>
          </div>
        )}

        {/* SUBMIT GOMB */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm tracking-wide mt-6"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Betöltés...
            </div>
          ) : (
            isSignUp ? 'Regisztráció' : 'Bejelentkezés'
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={() => {
            setShowForm(false)
            setEmail('')
            setPassword('')
            setFirstName('')
            setLastName('')
            setApartmentNumber('')
            setSignUpPassword('')
            setConfirmPassword('')
            setError('')
            setSuccess('')
          }}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors duration-200"
        >
          ← Vissza
        </button>
      </div>
    </div>
  )
}

