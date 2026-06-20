import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { put } from '@vercel/blob'
import { buildPDF, DOCS, FSX_MAP, DOC_TYPE_MAP } from '../../court/generate-pdf/route'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * VALORAIPLUS//e — Tiered Cold-Storage Seal
 * Case CUD-26-682107
 *
 * Maintains the evidence seal OFF DISK across three independent channels so no
 * single location is a point of failure or tampering:
 *
 *   TIER 1 — Bitcoin OP_RETURN anchor (immutable, third-party verifiable).
 *            We PREPARE the 32-byte payload; the operator broadcasts it from
 *            their own wallet (no keys are ever held by the app) and posts the
 *            txid back via /api/anchor/verify.
 *
 *   TIER 2 — Full evidence bundle archived to PRIVATE Vercel Blob object
 *            storage (off the app's disk; not publicly reachable).
 *
 *   LEDGER — An append-only, immutable row in Supabase
 *            (valoraiplus_cold_storage_seals) binding all tiers together.
 *
 *   EXPORT — A self-contained offline seal file (JSON) the operator downloads
 *            and keeps in air-gapped cold storage (USB / printed).
 *
 * Because the source PDFs are byte-deterministic, the full bundle can always be
 * regenerated and re-verified against these hashes. The Master Root is the
 * SHA-256 of the canonical (key-sorted) manifest of every exhibit hash.
 *
 * MANDATORY DISCLAIMER: demonstration / integrity artifact. Not bank approval,
 * regulatory certification, solvency verification, or independent audit opinion.
 */

const MANDATORY_DISCLAIMER =
  'This is a demonstration artifact. It is not bank approval, regulatory ' +
  'certification, financial solvency verification, or independent audit opinion.'

const CASE_NO = 'CUD-26-682107'
const COURT = 'SUPERIOR COURT OF CALIFORNIA, COUNTY OF SAN FRANCISCO'
const SEAL_VERSION = 'VALORAIPLUS-COLDSEAL-1.0'

// Recursive key-sort for deterministic canonical JSON (same contract as
// /api/court/provenance so Master Roots reconcile across endpoints).
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

function exhibitLabel(id: number): string {
  if (id === 1161) return 'C116A'
  if (id === 1162) return 'C116B'
  return `C${String(id).padStart(3, '0')}`
}

interface BundleEntry {
  exhibit: string
  document_id: number
  name: string
  file_name: string
  doc_type_code: string | null
  fsx_transaction: string | null
  byte_length: number
  sha256: string
  base64?: string
}

// Regenerate every exhibit, hash it, and (optionally) capture its bytes.
async function buildBundle(includeBytes: boolean): Promise<BundleEntry[]> {
  const ids = Object.keys(DOCS)
    .map(Number)
    .sort((a, b) => a - b)
  const out: BundleEntry[] = []
  for (const id of ids) {
    const doc = DOCS[id]
    const bytes = await buildPDF(id)
    const buf = Buffer.from(bytes)
    const entry: BundleEntry = {
      exhibit: exhibitLabel(id),
      document_id: id,
      name: doc.name,
      file_name: doc.pdfName,
      doc_type_code: DOC_TYPE_MAP[id] ?? null,
      fsx_transaction: FSX_MAP[id] ?? null,
      byte_length: buf.length,
      sha256: crypto.createHash('sha256').update(buf).digest('hex'),
    }
    if (includeBytes) entry.base64 = buf.toString('base64')
    out.push(entry)
  }
  return out
}

function buildManifest(bundle: BundleEntry[]) {
  return {
    schema_version: SEAL_VERSION,
    case_number: CASE_NO,
    court: COURT,
    hash_algorithm: 'SHA-256',
    exhibit_count: bundle.length,
    exhibits: bundle.map((e) => ({
      exhibit: e.exhibit,
      file_name: e.file_name,
      sha256: e.sha256,
      byte_length: e.byte_length,
    })),
  }
}

// Bitcoin OP_RETURN payload. The 32-byte Master Root is the on-chain commitment.
// We expose it as hex plus a tagged human label; the operator broadcasts it.
function buildOpReturn(masterRoot: string) {
  // 32-byte root = 64 hex chars. A bare OP_RETURN can hold up to 80 bytes, so
  // the raw root fits comfortably. We provide both the bare root (preferred,
  // minimal) and a tagged variant for human-readable provenance.
  const tag = `VLP1:${CASE_NO}:`
  const tagged = Buffer.concat([
    Buffer.from(tag, 'utf8'),
    Buffer.from(masterRoot, 'hex'),
  ])
  return {
    commitment_hash: masterRoot, // 32 bytes, hex
    payload_hex_bare: masterRoot,
    payload_hex_tagged: tagged.toString('hex'),
    tagged_byte_length: tagged.length,
    network: 'bitcoin-mainnet',
    script_hint: `OP_RETURN <${masterRoot}>`,
    instructions:
      'Broadcast a transaction with a single OP_RETURN output carrying ' +
      'payload_hex_bare (the 32-byte Master Root). Keep the change output to ' +
      'your own wallet. After 1+ confirmations, POST the txid to ' +
      '/api/anchor/verify to bind it to this seal. No private keys are held ' +
      'by this system.',
  }
}

export async function POST(req: NextRequest) {
  let body: { label?: string; archiveBundle?: boolean } = {}
  try {
    body = await req.json()
  } catch {
    /* defaults */
  }

  const label = (body.label ?? `cold-seal-${new Date().toISOString()}`).slice(0, 120)
  const archiveBundle = body.archiveBundle !== false // default true

  // ── Build deterministic bundle + Master Root ────────────────────────────
  const bundle = await buildBundle(archiveBundle)
  const manifest = buildManifest(bundle)
  const canonicalManifest = JSON.stringify(sortedKeys(manifest))
  const manifestSha256 = crypto
    .createHash('sha256')
    .update(canonicalManifest, 'utf8')
    .digest('hex')
  const masterRoot = manifestSha256 // root == sha256(canonical manifest)
  const opReturn = buildOpReturn(masterRoot)

  // ── TIER 2: archive the full evidence bundle to PRIVATE Blob ────────────
  let blob: { pathname: string; url: string; byteLength: number } | null = null
  if (archiveBundle) {
    const archive = {
      schema_version: SEAL_VERSION,
      case_number: CASE_NO,
      sealed_at: new Date().toISOString(),
      master_root_hash: masterRoot,
      manifest,
      exhibits: bundle, // includes base64 PDF bytes
      mandatory_disclaimer: MANDATORY_DISCLAIMER,
    }
    const json = Buffer.from(JSON.stringify(archive), 'utf8')
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const uploaded = await put(
      `cold-storage/${CASE_NO}/bundle_${stamp}_${masterRoot.slice(0, 12)}.json`,
      json,
      { access: 'private', contentType: 'application/json', addRandomSuffix: false },
    )
    blob = { pathname: uploaded.pathname, url: uploaded.url, byteLength: json.length }
  }

  // ── Offline export seal file (air-gapped cold storage) ──────────────────
  const sealFile = {
    schema_version: SEAL_VERSION,
    case_number: CASE_NO,
    court: COURT,
    seal_label: label,
    sealed_at: new Date().toISOString(),
    exhibit_count: bundle.length,
    master_root_hash: masterRoot,
    manifest_sha256: manifestSha256,
    manifest, // hashes only (no bytes) — small enough to print
    bitcoin_anchor: opReturn,
    blob_archive: blob
      ? { pathname: blob.pathname, byte_length: blob.byteLength }
      : null,
    verification:
      'Regenerate any exhibit from the deterministic generator and run ' +
      'sha256sum to match the manifest. Reconstruct the Master Root as ' +
      'SHA-256 of the canonical key-sorted manifest JSON.',
    mandatory_disclaimer: MANDATORY_DISCLAIMER,
  }
  const sealFileJson = JSON.stringify(sealFile, null, 2)
  const sealFileSha256 = crypto
    .createHash('sha256')
    .update(sealFileJson, 'utf8')
    .digest('hex')

  // ── LEDGER: append immutable row binding all tiers ──────────────────────
  let ledgerId: string | null = null
  let ledgerError: string | null = null
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('valoraiplus_cold_storage_seals')
      .insert({
        case_file: CASE_NO,
        seal_label: label,
        tier: archiveBundle ? 'tier2_full_bundle' : 'tier1_root_anchor',
        exhibit_count: bundle.length,
        master_root_hash: masterRoot,
        manifest_sha256: manifestSha256,
        op_return_payload: opReturn.payload_hex_bare,
        blob_pathname: blob?.pathname ?? null,
        blob_url: blob?.url ?? null,
        blob_byte_length: blob?.byteLength ?? null,
        anchor_network: 'bitcoin-mainnet',
        seal_file_sha256: sealFileSha256,
      })
      .select('id')
      .single()
    if (error) ledgerError = error.message
    else ledgerId = data?.id ?? null
  } catch (e) {
    ledgerError = e instanceof Error ? e.message : 'ledger insert failed'
  }

  return NextResponse.json({
    ok: true,
    system: 'VALORAIPLUS//e',
    instrument: 'Tiered Cold-Storage Seal',
    case_number: CASE_NO,
    seal_label: label,
    sealed_at: sealFile.sealed_at,
    exhibit_count: bundle.length,
    master_root_hash: masterRoot,
    manifest_sha256: manifestSha256,
    tiers: {
      tier1_bitcoin_anchor: opReturn,
      tier2_blob_archive: blob
        ? { pathname: blob.pathname, byte_length: blob.byteLength, access: 'private' }
        : { archived: false },
      ledger: { id: ledgerId, table: 'valoraiplus_cold_storage_seals', error: ledgerError },
    },
    offline_seal_file: sealFile,
    offline_seal_file_sha256: sealFileSha256,
    mandatory_disclaimer: MANDATORY_DISCLAIMER,
  })
}

// List sealing history from the immutable ledger.
export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('valoraiplus_cold_storage_seals')
      .select(
        'id, seal_label, tier, exhibit_count, master_root_hash, manifest_sha256, op_return_payload, blob_pathname, anchor_network, anchor_txid, anchor_confirmed_at, seal_file_sha256, created_at',
      )
      .eq('case_file', CASE_NO)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      case_number: CASE_NO,
      seal_count: data?.length ?? 0,
      seals: data ?? [],
      mandatory_disclaimer: MANDATORY_DISCLAIMER,
    })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'query failed' },
      { status: 500 },
    )
  }
}
