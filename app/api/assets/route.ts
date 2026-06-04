import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()

  const { data: assets, error } = await supabase
    .from('valoraiplus_project_assets')
    .select('*')
    .order('role', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ assets: [], error: error.message }, { status: 500 })
  }

  return NextResponse.json({ assets: assets ?? [] })
}
