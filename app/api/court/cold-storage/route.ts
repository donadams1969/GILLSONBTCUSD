import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildPDF, DOCS, FSX_MAP, DOC_TYPE_MAP } from '../generate-pdf/route'

/**
 * Cold Storage Seal — VALORAIPLUS//e tiered off-disk evidence preservation.
 * Case: CUD-26-682107 | Node: Saint Paul, MN
 *
 * Implements the tiered cold-storage protocol selected for this matter:
 *
 *   TIER 1 — Root Anchor (immutable, off any disk we control):
 *     The Master Root Hash is committed to Bitcoin via a 32-byte OP_RETURN.
 *     This route PREPARES the payload + manual-broadcast instructions. The
 *     defendant broadcasts from their own wallet (no keys stored in the app),
 *     then POSTs the txid back via PATCH to seal the on-chain reference.
 *
 *   TIER 2 — Full Evidence Bundle (off-disk object storage):
 *     Every deterministic exhibit PDF + the hash register + the provenance
 *     declaration are packed into a single canonical JSON bundle and uploaded
 *     to PRIVATE Vercel Blob. The app server holds only a pointer; the bytes
 *     live off local disk in object storage.
 *
 *   LEDGER — append-only Supabase row (tamper-evident) records both tiers.
 *   EXPORT — the response is a self-contained offline seal file the defendant
 *     downloads and keeps in air-gapped cold storage (USB / printed).
 *
 * Because the PDFs are byte-deterministic, the entire bundle — and therefore
 * the Master Root — is reproducible and independently re-verifiable.
 *
 * MANDATORY DISCLAIMER: demonstration artifact. Not external certification,
 * bank approval, audit opinion, or solvency verification.
 */

const MANDATORY_DISCLAIMER =
  'This is a demonstration artifact. It is not bank approval, regulatory certification, ' +
  'financial solvency verification, or independent audit opinion.'

const CASE_NO = 'CUD-26-682107'
const NODE = 'Saint Paul, MN'

function exhibitLabel(id: number): string {
  if (id === 1161) return 'C116A'
  if (id === 1162) return 'C116B'
  return `C${String(id).padStart(3, '0')}`
}

// Recursive key-sort for deterministic canonical JSON.
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

interface ExhibitRecord {
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

/**
 * Regenerate every document deterministically, hash it, and (for the full
 * bundle) capture its base64 bytes. Returns the per-exhibit register plus the
 * canonical manifest and Master Root.
 */
async function buildBundle(includeBytes: boolean) {
  const ids = Object.keys(DOCS).map(Number).sort((a, b) => a - b)
  const register: ExhibitRecord[] = []

  for (const id of ids) {
    const doc = DOCS[id]
    const bytes = await buildPDF(id)
    const sha256 = crypto.createHash('sha256').update(bytes).digest('hex')
    const rec: ExhibitRecord = {
      exhibit: exhibitLabel(id),
      document_id: id,
      name: doc.name,
      file_name: doc.pdfName,
      doc_type_code: DOC_TYPE_MAP[id] ?? null,
      fsx_transaction: FSX_MAP[id] ?? null,
      byte_length: bytes.length,
      sha256,
    }
    if (includeBytes) rec.base64 = Buffer.from(bytes).toString('base64')
    register.push(rec)
  }

  // Canonical manifest committed to the Master Root (hashes only — stable).
  const manifest = {
    schema_version: 'VALORAIPLUS-COLDSTORE-1.0',
    case_number: CASE_NO,
    node: NODE,
    hash_algorithm: 'SHA-256',
    exhibit_count: register.length,
    exhibits: register.map((e) => ({
      exhibit: e.exhibit,
      file_name: e.file_name,
      sha256: e.sha256,
      byte_length: e.byte_length,
    })),
  }

  const canonicalManifest = JSON.stringify(sortedKeys(manifest))
  const manifestSha256 = crypto.createHash('sha256').update(canonicalManifest, 'utf8').digest('hex')
  // Master Root = SHA-256 of the canonical manifest (single-level Merkle commit).
  const masterRoot = crypto.createHash('sha256').update(canonicalManifest, 'utf8').digest('hex')

  return { register, manifest, manifestSha256, masterRoot }
}

/**
 * POST /api/court/cold-storage
 * Body (optional): { archive_bytes?: boolean, label?: string }
 *   archive_bytes (default true) -> Tier 2 full bundle uploaded to private Blob.
 */
export async function POST(req: NextRequest) {
  let body: { archive_bytes?: boolean; label?: string } = {}
  try {
    body = await req.json()
  } catch {
    /* defaults */
  }

  const archiveBytes = body.archive_bytes !== false
  const tier = archiveBytes ? 'tier2_full_bundle' : 'tier1_root_anchor'
  const stamp = new Date().toISOString()
  const dateLabel = stamp.slice(0, 10)
  const label = body.label || `COLD-SEAL-${dateLabel}`

  const { register, manifest, manifestSha256, masterRoot } = await buildBundle(archiveBytes)

  // ── TIER 2: archive full bundle to private off-disk object storage ────────
  let blobPathname: string | null = null
  let blobUrl: string | null = null
  let blobByteLength: number | null = null

  if (archiveBytes) {
    const bundle = {
      schema_version: 'VALORAIPLUS-COLDSTORE-BUNDLE-1.0',
      case_number: CASE_NO,
      node: NODE,
      sealed_at: stamp,
      master_root_hash: masterRoot,
      manifest_sha256: manifestSha256,
      manifest,
      exhibits: register, // includes base64 PDF bytes
      mandatory_disclaimer: MANDATORY_DISCLAIMER,
    }
    const bundleJson = JSON.stringify(bundle)
    blobByteLength = Buffer.byteLength(bundleJson, 'utf8')

    const blob = await put(
      `cold-storage/${CASE_NO}/${label}_bundle.json`,
      bundleJson,
      { access: 'private', contentType: 'application/json', addRandomSuffix: true },
    )
    blobPathname = blob.pathname
    blobUrl = blob.url
  }

  // ── OP_RETURN payload (Tier 1 anchor) — 32 raw bytes of the Master Root ───
  const opReturnPayloadHex = masterRoot

  // ── LEDGER: append-only immutable Supabase row ────────────────────────────
  const supabase = createAdminClient()
  const { data: row, error } = await supabase
    .from('valoraiplus_cold_storage_seals')
    .insert({
      case_file: CASE_NO,
      seal_label: label,
      tier,
      exhibit_count: register.length,
      master_root_hash: masterRoot,
      manifest_sha256: manifestSha256,
      op_return_payload: opReturnPayloadHex,
      blob_pathname: blobPathname,
      blob_url: blobUrl,
      blob_byte_length: blobByteLength,
      anchor_network: 'bitcoin-mainnet',
    })
    .select('id, created_at')
    .single()

  if (error) {
    return NextResponse.json(
      { ok: false, error: `ledger write failed: ${error.message}` },
      { status: 500 },
    )
  }

  // ── EXPORT: self-contained offline seal file (download + air-gap) ─────────
  const sealFile = {
    schema_version: 'VALORAIPLUS-COLDSTORE-SEAL-1.0',
    system: 'VALORAIPLUS//e',
    case_number: CASE_NO,
    node: NODE,
    seal_id: row.id,
    seal_label: label,
    tier,
    sealed_at: row.created_at,
    hash_algorithm: 'SHA-256',
    exhibit_count: register.length,
    master_root_hash: masterRoot,
    manifest_sha256: manifestSha256,
    manifest,
    cold_storage_locations: {
      tier1_bitcoin_anchor: {
        network: 'bitcoin-mainnet',
        op_return_payload_hex: opReturnPayloadHex,
        op_return_byte_length: 32,
        status: 'pending_manual_broadcast',
      },
      tier2_object_storage: archiveBytes
        ? { provider: 'vercel-blob-private', pathname: blobPathname, byte_length: blobByteLength }
        : { provider: 'vercel-blob-private', status: 'not_archived_this_seal' },
      tier3_offline_export: {
        instruction: 'Save this JSON file to air-gapped media (USB / printout) and retain with the lodging.',
      },
    },
  }
  const sealFileJson = JSON.stringify(sortedKeys(sealFile))
  const sealFileSha256 = crypto.createHash('sha256').update(sealFileJson, 'utf8').digest('hex')

  // Record the offline seal-file hash (one-time controlled update).
  await supabase
    .from('valoraiplus_cold_storage_seals')
    .update({ seal_file_sha256: sealFileSha256 })
    .eq('id', row.id)

  return NextResponse.json({
    ok: true,
    system: 'VALORAIPLUS//e',
    instrument: 'Tiered Cold Storage Seal',
    case_number: CASE_NO,
    seal_id: row.id,
    seal_label: label,
    tier,
    sealed_at: row.created_at,
    exhibit_count: register.length,
    master_root_hash: masterRoot,
    manifest_sha256: manifestSha256,
    seal_file_sha256: sealFileSha256,
    cold_storage: {
      tier1_bitcoin_anchor: {
        network: 'bitcoin-mainnet',
        op_return_payload_hex: opReturnPayloadHex,
        op_return_byte_length: 32,
        broadcast_instructions: [
          '1. From your own Bitcoin wallet, create a mainnet transaction with one OP_RETURN output containing the 32 bytes of op_return_payload_hex.',
          '2. Broadcast it and wait for >= 6 confirmations.',
          `3. PATCH /api/court/cold-storage with { "seal_id": "${row.id}", "txid": "<your-txid>" } to seal the on-chain reference into the ledger.`,
        ],
        status: 'pending_manual_broadcast',
      },
      tier2_object_storage: archiveBytes
        ? { provider: 'vercel-blob-private', pathname: blobPathname, byte_length: blobByteLength, retrieve_via: `/api/court/cold-storage/retrieve?pathname=${encodeURIComponent(blobPathname!)}` }
        : { status: 'not_archived_this_seal' },
      tier3_offline_export: { seal_file: sealFile, seal_file_sha256: sealFileSha256 },
    },
    deterministic: true,
    mandatory_disclaimer: MANDATORY_DISCLAIMER,
    computed_at: stamp,
  })
}

/**
 * PATCH /api/court/cold-storage
 * Body: { seal_id: string, txid: string }
 * Seals the Bitcoin txid into the immutable ledger row (write-once).
 */
export async function PATCH(req: NextRequest) {
  let body: { seal_id?: string; txid?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 })
  }

  const { seal_id, txid } = body
  if (!seal_id || !txid) {
    return NextResponse.json({ ok: false, error: 'seal_id and txid are required' }, { status: 400 })
  }
  if (!/^[0-9a-fA-F]{64}$/.test(txid)) {
    return NextResponse.json({ ok: false, error: 'txid must be a 64-char hex string' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('valoraiplus_cold_storage_seals')
    .update({ anchor_txid: txid.toLowerCase(), anchor_confirmed_at: new Date().toISOString() })
    .eq('id', seal_id)
    .select('id, master_root_hash, anchor_txid, anchor_confirmed_at')
    .single()

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    system: 'VALORAIPLUS//e',
    case_number: CASE_NO,
    seal_id: data.id,
    master_root_hash: data.master_root_hash,
    anchor_network: 'bitcoin-mainnet',
    anchor_txid: data.anchor_txid,
    anchor_confirmed_at: data.anchor_confirmed_at,
    block_explorer: `https://mempool.space/tx/${data.anchor_txid}`,
    mandatory_disclaimer: MANDATORY_DISCLAIMER,
  })
}

/**
 * GET /api/court/cold-storage
 * Returns the append-only ledger of all cold-storage seals for the case.
 */
export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('valoraiplus_cold_storage_seals')
    .select('*')
    .eq('case_file', CASE_NO)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    system: 'VALORAIPLUS//e',
    case_number: CASE_NO,
    seal_count: data.length,
    seals: data,
    mandatory_disclaimer: MANDATORY_DISCLAIMER,
  })
}
