import { createClient } from '@/lib/supabase/server'
import { redirect as nextRedirect } from 'next/navigation'
import AuthForm from '@/components/auth/AuthForm'
import { Link } from '@/config/routing'
import { getTranslations } from 'next-intl/server'

export default async function AuthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const t = await getTranslations('auth')

  // If user is logged in and email is verified, redirect to dashboard
  if (user && user.email_confirmed_at) {
    nextRedirect('/dashboard')
  }

  // If user is logged in but email is not verified, redirect to verification page
  if (user && !user.email_confirmed_at) {
    nextRedirect(`/auth/verify-email?email=${encodeURIComponent(user.email || '')}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 flex flex-col px-4 overflow-hidden relative">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header/Navigation */}
      <div className="relative z-10 bg-white/10 backdrop-blur-sm py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <Link href="/" className="text-2xl font-bold text-white hover:text-gray-100 transition-colors flex items-center gap-2">
            <span className="text-3xl">🧺</span>
            <span>CleanCycle</span>
          </Link>
          <Link href="/" className="text-white hover:text-gray-100 font-medium transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('backToHome')}
          </Link>
        </div>
      </div>

      {/* Auth Form Container - Centered */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-12">
        <AuthForm />
      </div>
    </main>
  );
}

