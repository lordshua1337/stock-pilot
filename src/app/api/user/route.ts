import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth/server'

export async function GET() {
  const user = await getUser()

  if (!user) {
    return NextResponse.json({ user: null, authenticated: false })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name ?? user.email,
    },
    authenticated: true,
  })
}
