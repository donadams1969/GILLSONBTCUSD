import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: nodes, error } = await supabase
    .from('valoraiplus_authorized_nodes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ nodes: [], error: error.message })
  }

  return NextResponse.json({ nodes: nodes ?? [] })
}
