import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"
export const dynamic = "force-dynamic"

// The expected OP_RETURN anchor payload for FINAL_COATS_2026.
// 6a20 = OP_RETURN + 32-byte push, followed by the SGAU anchor hash.
const EXPECTED_PAYLOAD = "6a20d55877c8e9d3d3d62325494f61f73b64c63f10ef97008c2a9693998782a2007e"
const EXPECTED_HASH = EXPECTED_PAYLOAD.slice(4) // strip 6a20 opcode prefix

const TXID_RE = /^[0-9a-fA-F]{64}$/

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export async function POST(req: NextRequest) {
  let body: { txid?: string }
  try {
    body = await req.json()
  } catch {
    return bad("Invalid JSON body")
  }

  const txid = (body.txid ?? "").trim().toLowerCase()
  if (!TXID_RE.test(txid)) {
    return bad("TXID must be exactly 64 hexadecimal characters")
  }

  // Read-only verification against a public Bitcoin explorer.
  // The node observes and validates -- it never holds keys or broadcasts.
  let tx: any
  try {
    const res = await fetch(`https://mempool.space/api/tx/${txid}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    if (res.status === 404) {
      return NextResponse.json({
        ok: false,
        txid,
        found: false,
        status: "NOT_FOUND",
        message: "Transaction not yet visible in mempool or chain. Awaiting broadcast propagation.",
      })
    }
    if (!res.ok) return bad(`Explorer returned ${res.status}`, 502)
    tx = await res.json()
  } catch {
    return bad("Unable to reach verification explorer", 502)
  }

  // Scan all outputs for the expected OP_RETURN anchor.
  const outputs: any[] = Array.isArray(tx.vout) ? tx.vout : []
  const opReturns = outputs
    .filter((o) => typeof o.scriptpubkey === "string" && o.scriptpubkey.startsWith("6a"))
    .map((o) => o.scriptpubkey.toLowerCase())

  const exactMatch = opReturns.includes(EXPECTED_PAYLOAD)
  const hashMatch = opReturns.some((s) => s.includes(EXPECTED_HASH))

  const confirmed = Boolean(tx.status?.confirmed)
  const blockHeight = tx.status?.block_height ?? null
  const blockTime = tx.status?.block_time ?? null

  let verdict: "SEALED" | "ANCHOR_PRESENT_UNCONFIRMED" | "FOUND_NO_ANCHOR"
  if ((exactMatch || hashMatch) && confirmed) verdict = "SEALED"
  else if (exactMatch || hashMatch) verdict = "ANCHOR_PRESENT_UNCONFIRMED"
  else verdict = "FOUND_NO_ANCHOR"

  return NextResponse.json({
    ok: true,
    txid,
    found: true,
    verdict,
    confirmed,
    blockHeight,
    blockTime,
    anchor: {
      expectedPayload: EXPECTED_PAYLOAD,
      exactMatch,
      hashMatch,
      opReturnCount: opReturns.length,
    },
    explorer: `https://mempool.space/tx/${txid}`,
    parentCid: "bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
    node: "SGAU-7226.3461",
    polledAt: Date.now(),
  })
}
