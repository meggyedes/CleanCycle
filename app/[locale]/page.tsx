import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const t = await getTranslations()

  // If user is logged in and email is verified, redirect to dashboard
  if (user && user.email_confirmed_at) {
    redirect('/dashboard')
  }

  // If user is logged in but email is not verified, redirect to verification page
  if (user && !user.email_confirmed_at) {
    redirect(`/auth/verify-email?email=${encodeURIComponent(user.email || '')}`)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-teal-600">🧺 {t('common.appName')}</div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/auth"
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded shadow-lg transition-colors uppercase text-sm tracking-wide"
            >
              {t('auth.login.submit')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section className="relative py-32 text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/homepage.png"
            alt={t('landing.title')}
            fill
            priority
            className="object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'Arial, sans-serif', fontStyle: 'italic' }}>
            {t('landing.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-95">
            {t('landing.subtitle')}
          </p>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            {t('landing.description')}
          </p>
          <Link
            href="/auth"
            className="inline-block bg-white text-teal-600 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition-colors uppercase text-sm tracking-wide"
          >
            {t('landing.getStarted')}
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">{t('landing.features.title')}</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">{t('landing.features.subtitle')}</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Real-time Tracking */}
            <div className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">{t('landing.features.realtime.title')}</h3>
              <p className="text-gray-600">
                {t('landing.features.realtime.description')}
              </p>
            </div>

            {/* Feature 2: Smart Scheduling */}
            <div className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">{t('landing.features.scheduling.title')}</h3>
              <p className="text-gray-600">
                {t('landing.features.scheduling.description')}
              </p>
            </div>

            {/* Feature 3: Instant Notifications */}
            <div className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">{t('landing.features.notifications.title')}</h3>
              <p className="text-gray-600">
                {t('landing.features.notifications.description')}
              </p>
            </div>

            {/* Feature 4: Usage Analytics */}
            <div className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">{t('landing.features.analytics.title')}</h3>
              <p className="text-gray-600">
                {t('landing.features.analytics.description')}
              </p>
            </div>

            {/* Feature 5: Multiple Rooms */}
            <div className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">{t('landing.features.multiRoom.title')}</h3>
              <p className="text-gray-600">
                {t('landing.features.multiRoom.description')}
              </p>
            </div>

            {/* Feature 6: Secure & Private */}
            <div className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">{t('landing.features.secure.title')}</h3>
              <p className="text-gray-600">
                {t('landing.features.secure.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">{t('landing.cta.title')}</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {t('landing.cta.description')}
          </p>
          <Link
            href="/auth"
            className="inline-block bg-white text-teal-600 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition-colors uppercase text-sm tracking-wide"
          >
            {t('landing.cta.button')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">🧺 {t('common.appName')} - {t('landing.subtitle')}</p>
          <p className="text-sm">Powered by Daniel Soos 2025</p>
        </div>
      </footer>
    </main>
  );
}

