'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'

interface PasswordStrengthIndicatorProps {
  password: string
  showRequirements?: boolean
}

interface PasswordRequirement {
  key: string
  label: string
  met: boolean
}

export default function PasswordStrengthIndicator({ 
  password, 
  showRequirements = true 
}: PasswordStrengthIndicatorProps) {
  const t = useTranslations('auth.register.passwordStrength')
  const [strength, setStrength] = useState(0)
  const [strengthLabel, setStrengthLabel] = useState('')
  const [strengthColor, setStrengthColor] = useState('')

  // Jelszó követelmények
  const requirements: PasswordRequirement[] = [
    {
      key: 'minLength',
      label: t('requirements.minLength'),
      met: password.length >= 8,
    },
    {
      key: 'uppercase',
      label: t('requirements.uppercase'),
      met: /[A-Z]/.test(password),
    },
    {
      key: 'lowercase',
      label: t('requirements.lowercase'),
      met: /[a-z]/.test(password),
    },
    {
      key: 'number',
      label: t('requirements.number'),
      met: /[0-9]/.test(password),
    },
  ]

  useEffect(() => {
    if (!password) {
      setStrength(0)
      setStrengthLabel('')
      setStrengthColor('')
      return
    }

    // Számoljuk ki a jelszó erősségét
    let score = 0
    
    // Hossz alapján
    if (password.length >= 8) score += 25
    if (password.length >= 12) score += 10
    if (password.length >= 16) score += 10

    // Nagybetű
    if (/[A-Z]/.test(password)) score += 20

    // Kisbetű
    if (/[a-z]/.test(password)) score += 20

    // Szám
    if (/[0-9]/.test(password)) score += 15

    // Speciális karakter
    if (/[^A-Za-z0-9]/.test(password)) score += 10

    setStrength(Math.min(score, 100))

    // Erősség címke és szín
    if (score < 40) {
      setStrengthLabel(t('weak'))
      setStrengthColor('bg-red-500')
    } else if (score < 70) {
      setStrengthLabel(t('medium'))
      setStrengthColor('bg-yellow-500')
    } else {
      setStrengthLabel(t('strong'))
      setStrengthColor('bg-green-500')
    }
  }, [password, t])

  if (!password) return null

  return (
    <div className="space-y-3">
      {/* Erősség bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            {t('label')}:
          </span>
          <span 
            className={`text-sm font-bold ${
              strength < 40 
                ? 'text-red-600' 
                : strength < 70 
                ? 'text-yellow-600' 
                : 'text-green-600'
            }`}
          >
            {strengthLabel}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      {/* Követelmények lista */}
      {showRequirements && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            {t('requirementsTitle')}:
          </p>
          <ul className="space-y-1.5">
            {requirements.map((req) => (
              <li
                key={req.key}
                className="flex items-center gap-2 text-sm"
              >
                {req.met ? (
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-red-500 flex-shrink-0"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                  {req.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

