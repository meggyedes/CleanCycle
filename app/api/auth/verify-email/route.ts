import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email és kód szükséges' },
        { status: 400 }
      )
    }

    if (code.length !== 6) {
      return NextResponse.json(
        { error: 'A kód 6 számjegyű kell, hogy legyen' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get user by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, verification_code, verification_code_expires, email_verified')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Felhasználó nem található' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (userData.email_verified) {
      return NextResponse.json(
        { error: 'Az email már megerősítve' },
        { status: 400 }
      )
    }

    // Check if code matches
    if (userData.verification_code !== code) {
      return NextResponse.json(
        { error: 'Érvénytelen kód' },
        { status: 400 }
      )
    }

    // Check if code is expired (15 minutes)
    const expiresAt = new Date(userData.verification_code_expires)
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'A kód lejárt. Kérj új kódot.' },
        { status: 400 }
      )
    }

    // Update user as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        verification_code: null,
        verification_code_expires: null,
      })
      .eq('id', userData.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Hiba történt a megerősítés során' },
        { status: 500 }
      )
    }

    // Update Supabase auth user metadata
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
      userData.id,
      {
        email_confirm: true,
      }
    )

    if (authUpdateError) {
      console.error('Auth update error:', authUpdateError)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Email sikeresen megerősítve!',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Szerver hiba' },
      { status: 500 }
    )
  }
}

