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

// Canonical DIRS v2 Saint Paul Node manifest. Used when the
// valoraiplus_audit_manifests table is unavailable, so the deterministic
// bundle hash is always reproducible regardless of DB state.
const CANONICAL_MANIFEST = {
  schema_version: 'DIRS-AUDIT-MANIFEST-2.1',
  attestation_id: 'ADIAM-22.07-SAINT-PAUL-NODE-SAMPLE',
  classification: 'sample_auditor_demonstration_not_external_certification',
  node: 'Saint Paul Node',
  decision: 'allow',
  event_type: 'report_exported',
  event_sequence: 2207,
  required_role: 'institutional_auditor',
  required_scope: 'AUDIT_EXPORT_SCOPE',
  canonical_payload_hash: '976e4a3d115a8b6e3af376faba3bdda221f273e06d97f621f3a97dbb8eb57eb0',
  event_hash: '5f9b681e1fd4084c60db2e8ecddc380880615cfabdf8fee1f6afaa1ed0274d9b',
  data_snapshot_hash: '8efb40881e644d388aeba3509b39be49c40e940d69cbf63910a7123504a9184c',
  control_mapping: [
    { control_family: 'Access Control', control_objective: 'role and scope authorization before export', implementation_evidence: 'jwtGate.ts + scope registry decision + denial logging', sample_status: 'demonstrated' },
    { control_family: 'Segregation of Duties', control_objective: 'requesting identity distinct from signing identity', implementation_evidence: 'JWT subject differs from HSM signing key identity', sample_status: 'demonstrated with sample identities' },
    { control_family: 'Audit and Accountability', control_objective: 'complete audit event with request identity, timestamp, decision, and hash chain', implementation_evidence: 'append-only event record + WORM target', sample_status: 'demonstrated' },
    { control_family: 'Non-Repudiation', control_objective: 'event signed by controlled hardware signing identity', implementation_evidence: 'sample detached signature field; production requires real HSM signature', sample_status: 'placeholder only' },
    { control_family: 'Contingency Planning', control_objective: 'recoverable audit evidence in alternate storage', implementation_evidence: 'secondary WORM sink + RPO/RTO targets + restore test requirement', sample_status: 'target defined' },
  ],
  generated_at: '2026-05-30T09:00:00-07:00',
}

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

  const { data: manifests } = await supabase
    .from('valoraiplus_audit_manifests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  // Use the stored manifest if present; otherwise fall back to the canonical
  // DIRS v2 manifest so the deterministic hash is always reproducible.
  const manifest = manifests && manifests.length > 0 ? manifests[0] : CANONICAL_MANIFEST
  const source = manifests && manifests.length > 0 ? 'database' : 'canonical_fallback'

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
    manifest_source: source,
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
