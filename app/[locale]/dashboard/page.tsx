import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardTabs from '@/components/dashboard/DashboardTabs'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is not logged in, redirect to auth
  if (!user) {
    redirect('/auth')
  }

  // If user is logged in but email is not verified, redirect to verification page
  if (!user.email_confirmed_at) {
    redirect(`/auth/verify-email?email=${encodeURIComponent(user.email || '')}`)
  }

  // Fetch rooms and machines data
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .order('name')

  const { data: machines } = await supabase
    .from('machines')
    .select('*')
    .order('room_id')
    .order('name')

  return (
    <DashboardTabs
      userId={user.id}
      rooms={rooms || []}
      machines={machines || []}
      userEmail={user.email}
    />
  )
}

