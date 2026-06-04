import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: agencies, error } = await supabase
    .from('valoraiplus_federal_ledger')
    .select('*')
    .order('wave', { ascending: true })

  if (error) {
    return NextResponse.json({ agencies: [], error: error.message })
  }

  return NextResponse.json({ agencies: agencies ?? [] })
}
