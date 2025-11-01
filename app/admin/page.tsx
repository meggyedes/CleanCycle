import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UserInfo from '@/components/auth/UserInfo'
import Link from 'next/link'
import AdminMachineManager from '@/components/admin/AdminMachineManager'
import AdminLogs from '@/components/admin/AdminLogs'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Check if user is admin or manager
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-teal-600">
            🧺 CleanCycle
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded shadow-lg transition duration-200 uppercase text-sm tracking-wide"
            >
              ← Dashboard
            </Link>
            <UserInfo />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Arial, sans-serif', fontStyle: 'italic' }}>
            🔧 Admin Panel
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            Gépek és rendszer kezelése
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Admin Sections */}
        <div className="space-y-8">
          {/* Machine Manager */}
          <section className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Gépek kezelése
            </h2>
            <AdminMachineManager />
          </section>

          {/* Logs */}
          {profile.role === 'admin' && (
            <section className="bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Rendszer naplók
              </h2>
              <AdminLogs />
            </section>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">🧺 CleanCycle - Laundry Management System</p>
          <p className="text-sm">Powered by Daniel Soos 2025</p>
        </div>
      </footer>
    </main>
  )
}

