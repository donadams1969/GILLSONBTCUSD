import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: tokens, error } = await supabase
    .from('valoraiplus_tokens')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ tokens: [], error: error.message })
  }

  return NextResponse.json({ tokens: tokens ?? [] })
}
