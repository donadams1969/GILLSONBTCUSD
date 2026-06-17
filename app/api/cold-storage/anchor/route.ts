import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * Binds a confirmed Bitcoin transaction id to an existing cold-storage seal.
 * Per the manual-broadcast model, the operator broadcasts the OP_RETURN
 * payload from their own wallet, then posts the txid here. The ledger guard
 * trigger permits anchor_txid to be written exactly once (null -> value); any
 * later change is rejected at the database level, preserving immutability.
 *
 * Body: { seal_id: string, txid: string, confirmed_at?: ISO string }
 */
export async function POST(req: NextRequest) {
  let body: { seal_id?: string; txid?: string; confirmed_at?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { seal_id, txid } = body
  if (!seal_id || !txid) {
    return NextResponse.json(
      { ok: false, error: 'seal_id and txid are required' },
      { status: 400 },
    )
  }

  // Basic Bitcoin txid shape check: 64 hex chars.
  if (!/^[0-9a-fA-F]{64}$/.test(txid)) {
    return NextResponse.json(
      { ok: false, error: 'txid must be 64 hexadecimal characters' },
      { status: 400 },
    )
  }

  try {
    const supabase = createServiceClient()

    // Ensure not already anchored (defense-in-depth; DB trigger also enforces).
    const { data: existing, error: readErr } = await supabase
      .from('valoraiplus_cold_storage_seals')
      .select('id, anchor_txid')
      .eq('id', seal_id)
      .single()

    if (readErr || !existing) {
      return NextResponse.json({ ok: false, error: 'Seal not found' }, { status: 404 })
    }
    if (existing.anchor_txid) {
      return NextResponse.json(
        { ok: false, error: 'Seal already anchored', anchor_txid: existing.anchor_txid },
        { status: 409 },
      )
    }

    const { data, error } = await supabase
      .from('valoraiplus_cold_storage_seals')
      .update({
        anchor_txid: txid.toLowerCase(),
        anchor_confirmed_at: body.confirmed_at ?? new Date().toISOString(),
      })
      .eq('id', seal_id)
      .select('id, master_root_hash, anchor_txid, anchor_confirmed_at')
      .single()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: 'Bitcoin anchor bound to cold-storage seal',
      seal: data,
      explorer_url: `https://mempool.space/tx/${txid.toLowerCase()}`,
    })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'anchor bind failed' },
      { status: 500 },
    )
  }
}
