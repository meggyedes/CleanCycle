import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import UserInfo from '@/components/auth/UserInfo'
import RoomSelector from '@/components/dashboard/RoomSelector'
import MachineGrid from '@/components/dashboard/MachineGrid'
import DashboardTabs from '@/components/dashboard/DashboardTabs'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdminOrManager = profile?.role === 'admin' || profile?.role === 'manager'

  // Get rooms
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .order('id')

  // Get all machines
  const { data: machines } = await supabase
    .from('machines')
    .select('*')
    .order('room_id')
    .order('name')

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
              href="/machines"
              className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
            >
              🧺 Gépek
            </Link>
            {isAdminOrManager && (
              <Link
                href="/admin"
                className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded shadow-lg transition duration-200 uppercase text-sm tracking-wide"
              >
                🔧 Admin
              </Link>
            )}
            <UserInfo />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Arial, sans-serif', fontStyle: 'italic' }}>
            Laundry Management System
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            Welcome to your laundry management dashboard
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Dashboard Tabs */}
        <DashboardTabs userId={user.id} rooms={rooms || []} machines={machines || []} />

        {/* Legacy Machine Grid Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Quick Machine Access</h2>
          <RoomSelector rooms={rooms || []} />
          <MachineGrid rooms={rooms || []} />
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

