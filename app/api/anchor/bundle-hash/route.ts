import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * DIRS v2 — Pre-Anchor Bundle Hash Computation
 * System: VALORAIPLUS//e | Service: DIRS v2 | Node: Saint Paul Node
 *
 * Computes the canonical SHA-256 over the stored audit manifest. This is the
 * 32-byte value you embed in the Bitcoin OP_RETURN output BEFORE broadcasting.
 *
 * This is NOT the final sealed bundle hash (that is computed post-anchor by
 * recompute-bundle-hash logic, combining manifest + verified receipt). This is
 * the merkle/anchor payload required to create the anchoring transaction.
 *
 * MANDATORY DISCLAIMER: sample/demonstration artifact. Not external
 * certification, bank approval, audit opinion, or solvency verification.
 */

const MANDATORY_DISCLAIMER =
  'This is a demonstration artifact. It is not bank approval, regulatory certification, ' +
  'financial solvency verification, FAPI certification, SOC 2 report, or independent audit opinion.'

// Recursive key-sort for deterministic canonical JSON
function sortedKeys(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj
  if (Array.isArray(obj)) return obj.map(sortedKeys)
  return Object.keys(obj as Record<string, unknown>)
    .sort()
    .reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = sortedKeys((obj as Record<string, unknown>)[k])
      return acc
    }, {})
}

export async function GET() {
  const supabase = await createClient()

  const { data: manifests, error } = await supabase
    .from('valoraiplus_audit_manifests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    return NextResponse.json(
      { ok: false, error: 'manifest_read_failed', detail: error.message },
      { status: 500 }
    )
  }

  if (!manifests || manifests.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'no_manifest_found', detail: 'Seed valoraiplus_audit_manifests first.' },
      { status: 404 }
    )
  }

  const manifest = manifests[0]

  // Build the canonical payload from the manifest's stable, auditable fields.
  const canonicalSource = {
    schema_version: manifest.schema_version,
    attestation_id: manifest.attestation_id,
    classification: manifest.classification,
    node: manifest.node,
    decision: manifest.decision,
    event_type: manifest.event_type,
    event_sequence: manifest.event_sequence,
    required_role: manifest.required_role,
    required_scope: manifest.required_scope,
    canonical_payload_hash: manifest.canonical_payload_hash,
    event_hash: manifest.event_hash,
    data_snapshot_hash: manifest.data_snapshot_hash,
    control_mapping: manifest.control_mapping,
    generated_at: manifest.generated_at,
  }

  const canonical = JSON.stringify(sortedKeys(canonicalSource))
  const bundleHash = crypto.createHash('sha256').update(canonical, 'utf8').digest('hex')

  // OP_RETURN payload: 32 raw bytes of the SHA-256 digest (hex encoded).
  const opReturnPayloadHex = bundleHash

  return NextResponse.json({
    ok: true,
    system: 'VALORAIPLUS//e',
    service: 'DIRS v2',
    node: manifest.node ?? 'Saint Paul Node',
    case_file: 'CUD-26-682107',
    attestation_id: manifest.attestation_id,
    bundle_hash_sha256: bundleHash,
    op_return_payload_hex: opReturnPayloadHex,
    op_return_byte_length: 32,
    anchor_instructions: [
      '1. Broadcast a Bitcoin mainnet transaction with an OP_RETURN output containing op_return_payload_hex (32 bytes).',
      '2. Wait for >= 6 confirmations.',
      '3. POST the resulting txid to /api/anchor/verify with this same bundle hash as merkle_root.',
    ],
    external_certification_status: 'not_claimed',
    mandatory_disclaimer: MANDATORY_DISCLAIMER,
    computed_at: new Date().toISOString(),
  })
}
