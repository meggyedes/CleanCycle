import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email szükséges' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get user by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email_verified')
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

    // Generate new verification code
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15) // 15 minutes expiry

    // Update user with new code
    const { error: updateError } = await supabase
      .from('users')
      .update({
        verification_code: verificationCode,
        verification_code_expires: expiresAt.toISOString(),
      })
      .eq('id', userData.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Hiba történt a kód generálása során' },
        { status: 500 }
      )
    }

    // TODO: Send email with verification code
    // For now, just log it (in production, use nodemailer or similar)
    console.log(`Verification code for ${email}: ${verificationCode}`)
    console.log(`Expires at: ${expiresAt.toISOString()}`)

    return NextResponse.json(
      {
        success: true,
        message: 'Új kód elküldve az email címedre',
        // In development, return the code for testing
        ...(process.env.NODE_ENV === 'development' && { code: verificationCode }),
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Szerver hiba' },
      { status: 500 }
    )
  }
}

