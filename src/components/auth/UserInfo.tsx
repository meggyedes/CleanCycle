import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'

export default async function UserInfo() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user profile with role
  const { data: profile } = await supabase
    .from('users')
    .select('name, role')
    .eq('id', user.id)
    .single()

  const displayName = profile?.name || user.email?.split('@')[0] || 'Felhasználó'
  const role = profile?.role || 'user'

  const roleLabels = {
    user: 'Lakó',
    manager: 'Gondnok',
    admin: 'Admin'
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="font-semibold text-gray-800">{displayName}</p>
        <p className="text-sm text-gray-600">
          {roleLabels[role as keyof typeof roleLabels]}
        </p>
      </div>
      <LogoutButton />
    </div>
  )
}

