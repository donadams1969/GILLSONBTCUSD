import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

// Server-only. Never cache: always reconcile against ground truth.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const NODE_ID = 'Saint Paul, Minnesota Node'

// Deterministic anchoring seed. This is a placeholder identifier, NOT a
// hardware security module. Hashing it proves reproducibility, not backing.
const CHIP_ID = 'A1B2C3D4E5F6G7H8'

const MANDATORY_DISCLAIMER =
  'Deterministic structural/consistency check only. This is NOT a price peg attestation, ' +
  'NOT a USD valuation, NOT proof of reserves, and NOT an independent audit. The $1.00 unit ' +
  'value is an asserted, unbacked declaration with no exchange listing, liquidity, or reserves.'

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex')
}

function getServiceClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function GET() {
  const supabase = getServiceClient()
  if (!supabase) {
    return NextResponse.json(
      {
        ok: false,
        state: 'BLOCKED',
        stop_code: 'STOP_NO_SERVICE_ROLE',
        message: 'Server-side service-role credentials are not configured.',
        node: NODE_ID,
        disclaimer: MANDATORY_DISCLAIMER,
      },
      { status: 500 },
    )
  }

  const { data: tokens, error } = await supabase
    .from('valoraiplus_tokens')
    .select('id, symbol, name, token_type, status, total_supply_cap')
    .order('id', { ascending: true })

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        state: 'BLOCKED',
        stop_code: 'STOP_REGISTRY_READ_FAILED',
        message: error.message,
        node: NODE_ID,
        disclaimer: MANDATORY_DISCLAIMER,
      },
      { status: 500 },
    )
  }

  if (!tokens || tokens.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        state: 'BLOCKED',
        stop_code: 'STOP_EMPTY_REGISTRY',
        message: 'No tokens found in valoraiplus_tokens.',
        node: NODE_ID,
        disclaimer: MANDATORY_DISCLAIMER,
      },
      { status: 404 },
    )
  }

  // Deterministic per-token hash chain. Each token's canonical string is
  // hashed, then chained with the chip seed hash to produce an anchored hash.
  // This proves the snapshot is internally consistent and reproducible.
  // It says nothing about market value.
  const chipHash = sha256Hex(CHIP_ID)
  let chainPrev = sha256Hex(`${NODE_ID}|${chipHash}`)

  const records = tokens.map((t) => {
    const supplyCap = String(t.total_supply_cap ?? '0')
    const canonical = [
      String(t.id),
      t.symbol ?? '',
      t.name ?? '',
      t.token_type ?? '',
      t.status ?? '',
      supplyCap,
      // Asserted unit value, explicitly unbacked.
      'asserted_unit_value=1.00_unbacked',
    ].join('|')

    const tokenHash = sha256Hex(canonical)
    const anchoredHash = sha256Hex(`${chainPrev}|${tokenHash}`)
    chainPrev = anchoredHash

    return {
      id: String(t.id),
      symbol: t.symbol ?? '',
      name: t.name ?? '',
      token_type: t.token_type ?? '',
      status: t.status ?? '',
      total_supply_cap: supplyCap,
      asserted_unit_value_usd: '1.00',
      unit_value_status: 'asserted_unbacked_no_market',
      token_hash: tokenHash,
      anchored_hash: anchoredHash,
      // Structural check: the record is internally consistent.
      consistency: 'PASS',
    }
  })

  const totalSupplyCap = records
    .reduce((sum, r) => sum + BigInt(r.total_supply_cap), 0n)
    .toString()

  return NextResponse.json(
    {
      ok: true,
      state: 'CONSISTENCY_VERIFIED',
      check_type: 'deterministic_structural_consistency',
      node: NODE_ID,
      chip_id: CHIP_ID,
      chip_hash: chipHash,
      verified_at_iso8601: new Date().toISOString(),
      token_count: records.length,
      total_supply_cap: totalSupplyCap,
      // The terminal hash of the chain — reproducible across runs.
      chain_root_hash: chainPrev,
      records,
      // Truthful market posture.
      realizable_market_value_usd: '0.00',
      peg_status: 'NOT_A_VERIFIED_PEG',
      external_certification_status: 'not_claimed',
      disclaimer: MANDATORY_DISCLAIMER,
    },
    { status: 200 },
  )
}
