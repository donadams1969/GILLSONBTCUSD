import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const BUNDLE_HASH = '5f9d43507ec6422f6c9079105534fe810f6b5f4d5bf7e3321d6f1d27b950443e'

/**
 * Honest forensic intelligence endpoint for the VALORAIPLUS Omni-Kodex.
 *
 * The seal only reports VERIFIED when an injected canonical hash
 * (canonical_hash) matches the observed snapshot hash (observed_hash).
 * Until the production byte-stream is injected, it stays SEAL_BLOCKED.
 */
async function buildState() {
  const supabase = await createClient()

  const { data: sync } = await supabase
    .from('valor_portal_token_sync')
    .select('*')
    .eq('registry_label', 'VALORAIPLUS_SUPPLY_CAP')
    .maybeSingle()

  const canonical = sync?.canonical_hash ?? null
  const observed = sync?.observed_hash ?? null
  const verified = Boolean(canonical && observed && canonical === observed)

  return {
    ledger_state: 'Ø',
    bundle_hash: sync?.bundle_hash ?? BUNDLE_HASH,
    snapshot_hash: observed,
    canonical_hash: canonical,
    total_supply_cap: sync?.total_supply_cap ?? 0,
    hash_verified: verified,
    status: verified ? 'SYNC_VERIFIED' : 'SEAL_BLOCKED',
    note: verified
      ? 'Canonical byte-stream matches observed snapshot. Ledger reconciled.'
      : 'Awaiting production byte-stream. Canonical hash not injected; seal intentionally blocked.',
    last_sync: sync?.last_sync ?? null,
  }
}

export async function GET() {
  return NextResponse.json(await buildState())
}

export async function POST(request: Request) {
  let body: { command_type?: string; ledger_state?: string } = {}
  try {
    body = await request.json()
  } catch {
    // tolerate empty / non-JSON bodies
  }

  const command = body.command_type ?? 'STATUS'
  const state = await buildState()

  return NextResponse.json({
    command_type: command,
    accepted: command === 'SYNC_AND_LOCK' || command === 'STATUS',
    ...state,
  })
}
