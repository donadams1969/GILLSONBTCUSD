"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Shield, Search, CheckCircle2, XCircle, Loader2, Clock, ExternalLink, AlertTriangle } from "lucide-react"

const EXPECTED_PAYLOAD = "6a20d55877c8e9d3d3d62325494f61f73b64c63f10ef97008c2a9693998782a2007e"

type VerifyResult = {
  ok: boolean
  txid?: string
  found?: boolean
  verdict?: "SEALED" | "ANCHOR_PRESENT_UNCONFIRMED" | "FOUND_NO_ANCHOR"
  status?: string
  message?: string
  confirmed?: boolean
  blockHeight?: number | null
  blockTime?: number | null
  anchor?: {
    expectedPayload: string
    exactMatch: boolean
    hashMatch: boolean
    opReturnCount: number
  }
  explorer?: string
  node?: string
  error?: string
}

const VERDICT_META: Record<string, { label: string; color: string; Icon: typeof CheckCircle2 }> = {
  SEALED: { label: "SEALED — ANCHOR CONFIRMED ON-CHAIN", color: "hsl(160 60% 45%)", Icon: CheckCircle2 },
  ANCHOR_PRESENT_UNCONFIRMED: { label: "ANCHOR PRESENT — AWAITING CONFIRMATION", color: "hsl(43 80% 55%)", Icon: Clock },
  FOUND_NO_ANCHOR: { label: "TX FOUND — ANCHOR PAYLOAD MISMATCH", color: "hsl(0 70% 55%)", Icon: XCircle },
}

export default function VerifyPage() {
  const [txid, setTxid] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const valid = /^[0-9a-fA-F]{64}$/.test(txid.trim())

  async function runVerify() {
    if (!valid) return
    setLoading(true)
    setErr(null)
    setResult(null)
    try {
      const res = await fetch("/api/verify/txid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txid: txid.trim() }),
      })
      const data: VerifyResult = await res.json()
      if (!data.ok && data.error) {
        setErr(data.error)
      } else {
        setResult(data)
      }
    } catch {
      setErr("Verification request failed. The node could not reach the explorer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" aria-hidden="true" />
            Return to Node
          </Link>
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60">
            SGAU-7226.3461
          </span>
        </div>

        {/* Title */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" aria-hidden="true" />
            <h1 className="text-xl font-serif font-bold tracking-tight">Anchor Verification Gate</h1>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
            The Saint Paul Node is a <span className="text-foreground font-semibold">Verification Engine</span>, not a
            broadcast gateway. It holds no keys and cannot move funds. Submit a confirmed Bitcoin TXID below and the node
            will poll the public mempool to validate the <span className="font-mono text-foreground">FINAL_COATS_2026</span> OP_RETURN anchor.
          </p>
        </header>

        {/* Expected payload reference */}
        <section className="border border-border bg-card p-4">
          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Expected Anchor Payload
          </p>
          <code className="text-[10px] font-mono text-primary break-all leading-relaxed block">
            {EXPECTED_PAYLOAD}
          </code>
          <p className="text-[9px] font-mono text-muted-foreground/60 mt-2">
            {"6a20 = OP_RETURN + 32-byte push // remainder = SGAU anchor hash"}
          </p>
        </section>

        {/* Input */}
        <section className="flex flex-col gap-3">
          <label htmlFor="txid" className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Transaction ID (64 hex characters)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="txid"
              type="text"
              value={txid}
              onChange={(e) => setTxid(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runVerify()}
              placeholder="e.g. a1b2c3...64 hex chars"
              spellCheck={false}
              autoComplete="off"
              className="flex-1 bg-background border border-border px-3 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              onClick={runVerify}
              disabled={!valid || loading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-[10px] font-mono font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Search className="w-3.5 h-3.5" aria-hidden="true" />}
              {loading ? "Polling" : "Verify"}
            </button>
          </div>
          {txid.length > 0 && !valid && (
            <p className="text-[10px] font-mono text-destructive flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
              TXID must be exactly 64 hexadecimal characters ({txid.trim().length}/64)
            </p>
          )}
        </section>

        {/* Error */}
        {err && (
          <div className="border border-destructive/40 bg-destructive/5 p-4 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-destructive shrink-0" aria-hidden="true" />
            <p className="text-xs font-mono text-destructive">{err}</p>
          </div>
        )}

        {/* Not found result */}
        {result && !result.found && (
          <div className="border border-border bg-card p-5 flex items-start gap-3">
            <Clock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-mono font-bold text-foreground uppercase tracking-wide">{result.status}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{result.message}</p>
            </div>
          </div>
        )}

        {/* Verdict result */}
        {result && result.found && result.verdict && (
          <div className="flex flex-col gap-4">
            {(() => {
              const meta = VERDICT_META[result.verdict]
              const Icon = meta.Icon
              return (
                <div
                  className="border p-5 flex items-center gap-3"
                  style={{ borderColor: `color-mix(in srgb, ${meta.color} 40%, transparent)`, backgroundColor: `color-mix(in srgb, ${meta.color} 8%, transparent)` }}
                >
                  <Icon className="w-6 h-6 shrink-0" style={{ color: meta.color }} aria-hidden="true" />
                  <p className="text-sm font-mono font-bold uppercase tracking-wide" style={{ color: meta.color }}>
                    {meta.label}
                  </p>
                </div>
              )
            })()}

            {/* Detail grid */}
            <dl className="grid grid-cols-2 gap-px bg-border border border-border">
              <Detail label="Confirmed" value={result.confirmed ? "YES" : "PENDING"} />
              <Detail label="Block Height" value={result.blockHeight != null ? String(result.blockHeight) : "—"} />
              <Detail label="Exact Payload Match" value={result.anchor?.exactMatch ? "TRUE" : "FALSE"} />
              <Detail label="OP_RETURN Outputs" value={String(result.anchor?.opReturnCount ?? 0)} />
              <Detail
                label="Block Time"
                value={result.blockTime ? new Date(result.blockTime * 1000).toISOString().replace("T", " ").slice(0, 19) + "Z" : "—"}
              />
              <Detail label="Node" value={result.node ?? "—"} />
            </dl>

            {result.explorer && (
              <a
                href={result.explorer}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-border px-4 py-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
                View on mempool.space
              </a>
            )}
          </div>
        )}

        {/* Doctrine footer */}
        <footer className="border-t border-border pt-4 text-[9px] font-mono text-muted-foreground/50 leading-relaxed">
          Separation of Duties: The Custodian initiates the broadcast via the authorized interface. The Node observes,
          validates, hashes, and records — it never broadcasts. No anonymous mutation. Open Claw: LOCK MAINTAINED.
        </footer>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card p-3">
      <dt className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{label}</dt>
      <dd className="text-xs font-mono font-bold text-foreground tabular-nums break-all">{value}</dd>
    </div>
  )
}
