#!/usr/bin/env node
/**
 * VALORAIPLUS_CANONICAL_SUPPLY_HASH_SEAL_V1
 *
 * Computes the canonical SHA-256 of the valoraiplus_tokens registry.
 * This MUST stay byte-identical to app/api/tokens/sync/route.ts so that
 * setting VALORAIPLUS_TOKENS_SNAPSHOT_SHA256 to the printed value flips the
 * seal to SEAL_VERIFIED.
 *
 * Usage:
 *   SUPABASE_URL="https://<project>.supabase.co" \
 *   SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" \
 *   node scripts/hash-valoraiplus-tokens.js
 *
 * Output (capture these exact lines):
 *   SNAPSHOT_SHA256=<computed_hash>
 *   ROW_COUNT=<n>
 */

const { createClient } = require('@supabase/supabase-js')
const { createHash } = require('crypto')

const NODE_ID = 'Saint Paul, Minnesota Node'

// Recursively sort object keys for byte-stable canonical JSON.
function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = canonicalize(value[key])
        return acc
      }, {})
  }
  return value
}

function sha256Hex(input) {
  return createHash('sha256').update(input, 'utf8').digest('hex')
}

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error(
      'STOP_NO_SERVICE_ROLE: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running.',
    )
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: tokens, error } = await supabase
    .from('valoraiplus_tokens')
    .select('id, symbol, name, token_type, status, total_supply_cap')
    .order('id', { ascending: true })

  if (error) {
    console.error('STOP_REGISTRY_READ_FAILED:', error.message)
    process.exit(1)
  }

  if (!tokens || tokens.length === 0) {
    console.error('STOP_EMPTY_REGISTRY: no rows in valoraiplus_tokens.')
    process.exit(1)
  }

  // String-normalize every field to prevent float/precision drift.
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

  // Exact lines to capture for the Vercel env var.
  console.log(`SNAPSHOT_SHA256=${computedHash}`)
  console.log(`ROW_COUNT=${registry.length}`)
}

main().catch((err) => {
  console.error('STOP_UNEXPECTED:', err?.message || err)
  process.exit(1)
})
