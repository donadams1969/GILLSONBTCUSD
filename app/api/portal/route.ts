import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()

  const [metrics, tokens, compliance, baseActivity, tokenSync] = await Promise.all([
    supabase.from('valor_portal_metrics').select('*').order('sort_order', { ascending: true }),
    supabase.from('valor_portal_tokens').select('*').order('sort_order', { ascending: true }),
    supabase.from('valor_portal_compliance').select('*').order('sort_order', { ascending: true }),
    supabase.from('valor_portal_base_activity').select('*').order('observed_at', { ascending: false }),
    supabase.from('valor_portal_token_sync').select('*').eq('registry_label', 'VALORAIPLUS_SUPPLY_CAP').maybeSingle(),
  ])

  return NextResponse.json({
    metrics: metrics.data ?? [],
    tokens: tokens.data ?? [],
    compliance: compliance.data ?? [],
    baseActivity: baseActivity.data ?? [],
    tokenSync: tokenSync.data ?? null,
  })
}
