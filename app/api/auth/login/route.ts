import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, rememberMe } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email és jelszó szükséges' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Bejelentkezés
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    if (data.user) {
      // Check if email is confirmed
      if (!data.user.email_confirmed_at) {
        return NextResponse.json(
          {
            error: 'Email not confirmed',
            needsVerification: true,
            email: data.user.email,
          },
          { status: 403 }
        )
      }

      // Update last_login és remember_me
      const { error: updateError } = await supabase
        .from('users')
        .update({
          last_login: new Date().toISOString(),
          remember_me: rememberMe || false,
        })
        .eq('id', data.user.id)

      if (updateError) {
        console.error('Update error:', updateError)
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Sikeres bejelentkezés',
          user: {
            id: data.user.id,
            email: data.user.email,
          },
          session: data.session,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Bejelentkezés sikertelen' },
      { status: 401 }
    )
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Szerver hiba' },
      { status: 500 }
    )
  }
}

