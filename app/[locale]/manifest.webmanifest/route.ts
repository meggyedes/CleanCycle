import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Get the origin from the request
  const { origin } = new URL(request.url)

  // Redirect to the root manifest.json
  return NextResponse.redirect(`${origin}/manifest.json`, { status: 301 })
}

