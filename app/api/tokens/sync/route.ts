import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

// Server-only. Never cache: always reconcile against ground truth.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const MANDATORY_DISCLAIMER =
  'This is a demonstration artifact. It is not bank approval, regulatory certification, ' +
  'financial solvency verification, FAPI certification, SOC 2 report, or independent audit opinion.'

const NODE_ID = 'Saint Paul, Minnesota Node'

/**
 * Recursively sort object keys so JSON.stringify produces a byte-stable,
 * reproducible canonical form regardless of column/insert ordering.
 */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = canonicalize((value as Record<string, unknown>)[key])
        return acc
      }, {})
  }
  return value
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex')
}

/**
 * Service-role client. Lives only inside the request handler so the secret
 * key is never bundled into client code or held in a global.
 */
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
        state: 'SEAL_BLOCKED',
        stop_code: 'STOP_NO_SERVICE_ROLE',
        message:
          'Server-side service-role credentials are not configured. ' +
          'Set SUPABASE_SERVICE_ROLE_KEY (and SUPABASE_URL) to enable canonical sync.',
        node: NODE_ID,
        disclaimer: MANDATORY_DISCLAIMER,
      },
      { status: 500 },
    )
  }

  // Read directly from ground truth, deterministically ordered.
  const { data: tokens, error } = await supabase
    .from('valoraiplus_tokens')
    .select('id, symbol, name, token_type, status, total_supply_cap')
    .order('id', { ascending: true })

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        state: 'SEAL_BLOCKED',
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
        state: 'SEAL_BLOCKED',
        stop_code: 'STOP_EMPTY_REGISTRY',
        message: 'No tokens found in valoraiplus_tokens.',
        node: NODE_ID,
        disclaimer: MANDATORY_DISCLAIMER,
      },
      { status: 404 },
    )
  }

  // String-safe supply cap formatting prevents float/precision drift on large
  // BIGINT values. Everything is normalized to strings before hashing.
  const registry = tokens.map((t) => ({
    id: String(t.id),
    symbol: t.symbol ?? '',
    name: t.name ?? '',
    token_type: t.token_type ?? '',
    status: t.status ?? '',
    total_supply_cap: String(t.total_supply_cap ?? '0'),
  }))

  const totalSupplyCap = registry
    .reduce((sum, t) => sum + BigInt(t.total_supply_cap), 0n)
    .toString()

  const snapshot = {
    schema: 'VALORAIPLUS_TOKENS_SNAPSHOT_V1',
    node: NODE_ID,
    token_count: registry.length,
    total_supply_cap: totalSupplyCap,
    tokens: registry,
  }

  const canonicalJson = JSON.stringify(canonicalize(snapshot))
  const computedHash = sha256Hex(canonicalJson)

  const expectedHash = process.env.VALORAIPLUS_TOKENS_SNAPSHOT_SHA256?.trim().toLowerCase()
  const hashMatched = !!expectedHash && expectedHash === computedHash
  const sealState = hashMatched ? 'SEAL_VERIFIED' : 'SEAL_BLOCKED'

  return NextResponse.json(
    {
      ok: hashMatched,
      state: sealState,
      stop_code: hashMatched ? null : expectedHash ? 'STOP_HASH_MISMATCH' : 'STOP_NO_EXPECTED_HASH',
      message: hashMatched
        ? 'Canonical registry hash matched. Seal verified.'
        : expectedHash
          ? 'Computed registry hash does not match VALORAIPLUS_TOKENS_SNAPSHOT_SHA256. Seal remains blocked.'
          : 'VALORAIPLUS_TOKENS_SNAPSHOT_SHA256 is not set. Set it to the computed_hash below to enable the seal.',
      node: NODE_ID,
      verified_at_iso8601: new Date().toISOString(),
      token_count: registry.length,
      total_supply_cap: totalSupplyCap,
      computed_hash: computedHash,
      expected_hash: expectedHash ?? null,
      snapshot,
      external_certification_status: 'not_claimed',
      disclaimer: MANDATORY_DISCLAIMER,
    },
    { status: hashMatched ? 200 : 409 },
  )
}
