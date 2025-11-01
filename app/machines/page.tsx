import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MachinesList from '@/components/machines/MachinesList'
import Link from 'next/link'

export default async function MachinesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is not logged in, redirect to auth
  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mosógépek & Szárítók</h1>
              <p className="text-gray-600 mt-1">Válassz egy gépet és foglald le az időpontot</p>
            </div>
            <Link
              href="/dashboard"
              className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              Vissza az irányítópultra
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MachinesList />
      </div>
    </div>
  )
}

