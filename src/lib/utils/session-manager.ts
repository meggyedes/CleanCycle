import { createClient } from '@/lib/supabase/client'

export async function checkExpiredSessions() {
  const supabase = createClient()
  
  // Get all active sessions that have passed their end time
  const { data: expiredSessions } = await supabase
    .from('sessions')
    .select('*, machines(*)')
    .eq('status', 'active')
    .lt('end_time', new Date().toISOString())

  if (expiredSessions && expiredSessions.length > 0) {
    for (const session of expiredSessions) {
      // Update session status
      await supabase
        .from('sessions')
        .update({
          status: 'finished',
          actual_end: new Date().toISOString()
        })
        .eq('id', session.id)

      // Update machine status to free
      await supabase
        .from('machines')
        .update({ status: 'free' })
        .eq('id', session.machine_id)

      // Log the action
      await supabase
        .from('logs')
        .insert({
          user_id: session.user_id,
          machine_id: session.machine_id,
          action: 'session_expired',
          details: {
            session_id: session.id,
            end_time: session.end_time
          }
        })

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: session.user_id,
          type: 'expired',
          message: `A ${session.machines?.name} használata lejárt. Kérjük, vegye ki a ruhákat!`
        })
    }
  }

  return expiredSessions?.length || 0
}

export async function finishSession(sessionId: number) {
  const supabase = createClient()

  // Get session
  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (!session) return

  // Update session
  await supabase
    .from('sessions')
    .update({
      status: 'finished',
      actual_end: new Date().toISOString()
    })
    .eq('id', sessionId)

  // Update machine
  await supabase
    .from('machines')
    .update({ status: 'free' })
    .eq('id', session.machine_id)

  // Log
  await supabase
    .from('logs')
    .insert({
      user_id: session.user_id,
      machine_id: session.machine_id,
      action: 'session_finished',
      details: {
        session_id: sessionId
      }
    })
}

