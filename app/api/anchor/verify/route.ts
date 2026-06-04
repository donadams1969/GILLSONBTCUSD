import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * DIRS v2 — Bitcoin Anchor Verification (hard-stop enforced)
 * System: VALORAIPLUS//e | Service: DIRS v2 | Node: Saint Paul Node
 *
 * Verifies a real on-chain Bitcoin transaction against the DIRS v2 bundle hash.
 * Enforces hard stops: invalid txid, tx not found, unconfirmed, insufficient
 * confirmations, missing OP_RETURN, merkle mismatch.
 *
 * MANDATORY DISCLAIMER: sample/demonstration artifact. Not external
 * certification, bank approval, audit opinion, or solvency verification.
 */

const MIN_CONFIRMATIONS = 6
const ESPLORA = 'https://blockstream.info/api'

const MANDATORY_DISCLAIMER =
  'This is a demonstration artifact. It is not bank approval, regulatory certification, ' +
  'financial solvency verification, FAPI certification, SOC 2 report, or independent audit opinion.'

const TXID_RE = /^[0-9a-f]{64}$/

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

function stop(stopCode: string, message: string, status = 422, extra: Record<string, unknown> = {}) {
  return NextResponse.json(
    {
      ok: false,
      verified: false,
      stop_code: stopCode,
      message,
      external_certification_status: 'not_claimed',
      mandatory_disclaimer: MANDATORY_DISCLAIMER,
      ...extra,
    },
    { status }
  )
}

async function logAudit(event: Record<string, unknown>) {
  try {
    const supabase = await createClient()
    await supabase.from('valoraiplus_anchor_audit_log').insert(event)
  } catch {
    // table may not exist yet; non-fatal
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('valoraiplus_anchor_receipts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ ok: true, receipts: [], note: 'receipts table not available' })
    return NextResponse.json({ ok: true, receipts: data ?? [] })
  } catch {
    return NextResponse.json({ ok: true, receipts: [] })
  }
}

export async function POST(request: Request) {
  let body: { txid?: string; merkle_root?: string }
  try {
    body = await request.json()
  } catch {
    return stop('STOP_BAD_REQUEST', 'Request body must be valid JSON.', 400)
  }

  const txid = (body.txid ?? '').trim().toLowerCase()
  const merkleRoot = (body.merkle_root ?? '').trim().toLowerCase()

  // HARD STOP: invalid txid format
  if (!TXID_RE.test(txid)) {
    await logAudit({ event_type: 'hard_stop', stop_code: 'STOP_INVALID_TXID', txid, message: 'TXID must be 64-char lowercase hex' })
    return stop('STOP_INVALID_TXID', 'TXID must be exactly 64 lowercase hexadecimal characters.', 422)
  }

  // Fetch the transaction from a live Bitcoin explorer
  let tx: {
    status?: { confirmed?: boolean; block_height?: number; block_hash?: string }
    vout?: Array<{ scriptpubkey?: string; scriptpubkey_type?: string; scriptpubkey_asm?: string }>
  }
  try {
    const res = await fetch(`${ESPLORA}/tx/${txid}`, { cache: 'no-store' })
    if (res.status === 404) {
      await logAudit({ event_type: 'hard_stop', stop_code: 'STOP_TX_NOT_FOUND', txid, message: 'not found on mainnet' })
      return stop('STOP_TX_NOT_FOUND', 'Transaction not found on Bitcoin mainnet.', 404)
    }
    if (!res.ok) {
      return stop('STOP_EXPLORER_ERROR', `Explorer returned HTTP ${res.status}.`, 502)
    }
    tx = await res.json()
  } catch (e) {
    return stop('STOP_EXPLORER_UNREACHABLE', `Could not reach Bitcoin explorer: ${(e as Error).message}`, 502)
  }

  // HARD STOP: unconfirmed
  if (!tx.status?.confirmed) {
    await logAudit({ event_type: 'hard_stop', stop_code: 'STOP_UNCONFIRMED', txid, message: 'tx in mempool, not mined' })
    return stop('STOP_UNCONFIRMED', 'Transaction is not yet confirmed (still in mempool).', 422)
  }

  const blockHeight = tx.status.block_height ?? 0
  const blockHash = tx.status.block_hash ?? ''

  // Confirmation count from chain tip
  let tipHeight = blockHeight
  try {
    const tipRes = await fetch(`${ESPLORA}/blocks/tip/height`, { cache: 'no-store' })
    if (tipRes.ok) tipHeight = parseInt(await tipRes.text(), 10)
  } catch {
    // fall back to block height (treated as 1 confirmation)
  }
  const confirmations = Math.max(0, tipHeight - blockHeight + 1)

  // HARD STOP: insufficient confirmations
  if (confirmations < MIN_CONFIRMATIONS) {
    await logAudit({ event_type: 'hard_stop', stop_code: 'STOP_INSUFFICIENT_CONFIRMATIONS', txid, block_height: blockHeight, message: `${confirmations}/${MIN_CONFIRMATIONS}` })
    return stop('STOP_INSUFFICIENT_CONFIRMATIONS', `Only ${confirmations} confirmation(s); require >= ${MIN_CONFIRMATIONS}.`, 422, { confirmations, required: MIN_CONFIRMATIONS, block_height: blockHeight })
  }

  // Extract OP_RETURN payload
  const opReturn = (tx.vout ?? []).find(v => v.scriptpubkey_type === 'op_return')
  if (!opReturn) {
    await logAudit({ event_type: 'hard_stop', stop_code: 'STOP_NO_OP_RETURN', txid, block_height: blockHeight, message: 'no OP_RETURN output' })
    return stop('STOP_NO_OP_RETURN', 'Transaction contains no OP_RETURN output.', 422)
  }

  // asm looks like "OP_RETURN OP_PUSHBYTES_32 <hex>"
  const asmParts = (opReturn.scriptpubkey_asm ?? '').split(' ')
  const payloadHex = asmParts[asmParts.length - 1]?.toLowerCase() ?? ''

  // HARD STOP: merkle root mismatch (only when a root is supplied)
  if (merkleRoot && payloadHex !== merkleRoot) {
    await logAudit({ event_type: 'hard_stop', stop_code: 'STOP_MERKLE_MISMATCH', txid, block_height: blockHeight, message: `on-chain ${payloadHex} != expected ${merkleRoot}` })
    return stop('STOP_MERKLE_MISMATCH', 'On-chain OP_RETURN payload does not match the expected bundle hash.', 422, {
      on_chain_payload: payloadHex,
      expected_merkle_root: merkleRoot,
    })
  }

  const verifiedAt = new Date().toISOString()

  // Build canonical receipt, then hash it (reproducible anchor_receipt_hash)
  const receiptCore = {
    txid,
    network: 'bitcoin_mainnet',
    merkle_root: merkleRoot || payloadHex,
    op_return_payload_hex: payloadHex,
    block_height: blockHeight,
    block_hash: blockHash,
    confirmation_count: confirmations,
    verified_at_iso8601: verifiedAt,
    verification_sources: ['blockstream.info'],
    external_certification_status: 'not_claimed',
  }
  const anchorReceiptHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(sortedKeys(receiptCore)), 'utf8')
    .digest('hex')

  const fullReceipt = { ...receiptCore, anchor_receipt_hash_sha256: anchorReceiptHash, mandatory_disclaimer: MANDATORY_DISCLAIMER }

  // Persist (non-fatal if tables don't exist yet)
  let persisted = false
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('valoraiplus_anchor_receipts').insert({
      ...receiptCore,
      anchor_receipt_hash_sha256: anchorReceiptHash,
      receipt: fullReceipt,
    })
    if (!error) {
      persisted = true
      await supabase.from('valoraiplus_anchor_audit_log').insert({
        event_type: 'anchor_verified',
        txid,
        block_height: blockHeight,
        anchor_receipt_hash: anchorReceiptHash,
        package_status: 'ANCHOR_CONFIRMED',
        message: `verified with ${confirmations} confirmations`,
      })
    }
  } catch {
    persisted = false
  }

  return NextResponse.json({
    ok: true,
    verified: true,
    persisted,
    system: 'VALORAIPLUS//e',
    service: 'DIRS v2',
    ...fullReceipt,
  })
}
