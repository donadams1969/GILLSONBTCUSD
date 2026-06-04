import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const [
    { count: tokenCount },
    { data: tokens },
    { count: nodeCount },
    { count: intelCount },
    { count: ghostCount },
    { count: federalCount }
  ] = await Promise.all([
    supabase.from('valoraiplus_tokens').select('*', { count: 'exact', head: true }),
    supabase.from('valoraiplus_tokens').select('symbol'),
    supabase.from('valoraiplus_authorized_nodes').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('valoraiplus_intelligence_reports').select('*', { count: 'exact', head: true }),
    supabase.from('valoraiplus_intelligence_reports').select('*', { count: 'exact', head: true }).eq('report_type', 'GHOST_PROTOCOL'),
    supabase.from('valoraiplus_federal_ledger').select('*', { count: 'exact', head: true })
  ])

  return NextResponse.json({
    totalTokens: tokenCount || 0,
    totalSupplyCap: 467525700,
    activeNodes: nodeCount || 0,
    totalIntelReports: intelCount || 0,
    ghostProtocolEvents: ghostCount || 0,
    federalAgencies: federalCount || 0,
    amathPower: 132.84
  })
}
