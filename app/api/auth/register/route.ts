import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, username, roomNumber, phoneNumber } = body

    // Validáció
    if (!email || !password || !firstName || !lastName || !username || !roomNumber) {
      return NextResponse.json(
        { error: 'Hiányzó kötelező mezők' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'A jelszó legalább 8 karakter hosszú kell, hogy legyen' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Regisztráció Supabase-en keresztül
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          username: username,
          room_number: roomNumber,
          phone_number: phoneNumber || null,
          name: `${firstName} ${lastName}`,
        },
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (data.user) {
      // Generate verification code
      const verificationCode = generateVerificationCode()
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 15) // 15 minutes expiry

      // Extra titkosítás: jelszó hash-elése bcrypt-tel (dupla titkosítás)
      const passwordHash = await bcrypt.hash(password, 12)

      // Insert user in database with verification code
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          username: username,
          room_number: roomNumber,
          phone_number: phoneNumber || null,
          verification_code: verificationCode,
          verification_code_expires: expiresAt.toISOString(),
          email_verified: false,
        })

      if (dbError) {
        console.error('Database insert error:', dbError)
        // If user already exists, try to update instead
        if (dbError.code === '23505') { // Unique constraint violation
          const { error: updateError } = await supabase
            .from('users')
            .update({
              verification_code: verificationCode,
              verification_code_expires: expiresAt.toISOString(),
              email_verified: false,
            })
            .eq('id', data.user.id)

          if (updateError) {
            console.error('Database update error:', updateError)
          }
        }
      }

      // Jelszó hash tárolása a user metadata-ban (opcionális, extra biztonság)
      await supabase.auth.updateUser({
        data: {
          password_hash: passwordHash,
        },
      })

      // TODO: Send email with verification code
      // For now, just log it (in production, use nodemailer or similar)
      console.log(`Verification code for ${email}: ${verificationCode}`)
      console.log(`Expires at: ${expiresAt.toISOString()}`)

      return NextResponse.json(
        {
          success: true,
          message: 'Sikeres regisztráció! Ellenőrizd az email fiókodat a megerősítő kódért.',
          user: {
            id: data.user.id,
            email: data.user.email,
          },
          // In development, return the code for testing
          ...(process.env.NODE_ENV === 'development' && { verificationCode }),
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      { error: 'Regisztráció sikertelen' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Szerver hiba' },
      { status: 500 }
    )
  }
}

