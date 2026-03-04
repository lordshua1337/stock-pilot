import { NextResponse } from 'next/server'

export async function GET() {
  const checks = {
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_service: !!process.env.SUPABASE_SERVICE_KEY,
    alpha_vantage: !!process.env.ALPHA_VANTAGE_API_KEY,
    claude: !!process.env.CLAUDE_API_KEY,
  }

  const healthy = Object.values(checks).every(Boolean)

  return NextResponse.json({
    status: healthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  })
}
