"use client"

import { useEffect, useMemo, useState } from "react"
import { useSafety } from "@/components/safety/SafetyProvider"
import { fmtDecimal } from "@/lib/format"

type FeedData = { answer: number; updatedAt: number }
type PricesResp = {
  tokens: Array<{ symbol: string; price: number; updatedAt: string }>
}

const FEED_KEYS = ["XAU_USD", "BTC_USD"] as const

export default function OraclePanel() {
  const { prefs } = useSafety()
  const isYouth = prefs.ageMode === "child" || prefs.ageMode === "teen"

  const [mode, setMode] = useState<"live" | "manual">("live")
  const [live, setLive] = useState<Record<string, FeedData> | null>(null)
  const [manual, setManual] = useState({ XAU_USD: 4135, BTC_USD: 98420 })

  useEffect(() => {
    let alive = true
    async function poll() {
      try {
        const res = await fetch("/api/oracle/prices")
        if (!res.ok) return
        const data: PricesResp = await res.json()
        if (!alive) return

        const mapped: Record<string, FeedData> = {}
        const leg = data.tokens.find((t) => t.symbol === "$LEG1904")
        const btc = data.tokens.find((t) => t.symbol === "$GILLBTC")
        if (leg) mapped.XAU_USD = { answer: leg.price, updatedAt: new Date(leg.updatedAt).getTime() }
        if (btc) mapped.BTC_USD = { answer: btc.price, updatedAt: new Date(btc.updatedAt).getTime() }
        setLive(mapped)
      } catch {
        // silent
      }
    }
    poll()
    const iv = setInterval(poll, 15_000)
    return () => { alive = false; clearInterval(iv) }
  }, [])

  useEffect(() => {
    if (isYouth) setMode("live")
  }, [isYouth])

  const xau = mode === "live" ? (live?.XAU_USD?.answer ?? manual.XAU_USD) : manual.XAU_USD
  const btc = mode === "live" ? (live?.BTC_USD?.answer ?? manual.BTC_USD) : manual.BTC_USD

  const updated = useMemo(() => {
    if (mode !== "live") return null
    const ts = live?.BTC_USD?.updatedAt ?? live?.XAU_USD?.updatedAt
    return ts ? new Date(ts).toISOString().replace("T", " ").slice(0, 19) + " UTC" : null
  }, [live, mode])

  return (
    <section className="border border-border bg-card" aria-labelledby="oracle-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border">
        <h2 id="oracle-heading" className="text-sm font-serif font-bold uppercase tracking-widest text-foreground">
          Oracle Feeds
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMode("live")}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors border ${
              mode === "live"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-secondary text-muted-foreground"
            }`}
          >
            Live
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            disabled={isYouth}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors border disabled:opacity-40 disabled:cursor-not-allowed ${
              mode === "manual"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-secondary text-muted-foreground"
            }`}
            title={isYouth ? "Disabled in youth safety mode" : "Override with manual values"}
          >
            Manual
          </button>
          {mode === "manual" && !isYouth && (
            <button
              type="button"
              onClick={() => setManual({ XAU_USD: 4135, BTC_USD: 98420 })}
              className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest border border-border bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {updated && (
        <div className="px-4 py-1.5 text-[10px] font-mono text-muted-foreground border-b border-border bg-secondary/50">
          Last update: {updated}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-px bg-border">
        {/* XAU/USD */}
        <div className="bg-card p-4 flex flex-col gap-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">XAU / USD</span>
          <span className="text-2xl font-mono font-bold text-primary tabular-nums">
            ${fmtDecimal.format(xau)}
          </span>
          {mode === "manual" && !isYouth && (
            <label className="flex flex-col gap-1 mt-1">
              <span className="sr-only">Manual XAU/USD override</span>
              <input
                type="number"
                value={manual.XAU_USD}
                onChange={(e) => setManual((p) => ({ ...p, XAU_USD: Number(e.target.value) || 0 }))}
                className="w-full bg-background border border-border px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>
          )}
        </div>

        {/* BTC/USD */}
        <div className="bg-card p-4 flex flex-col gap-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">BTC / USD</span>
          <span className="text-2xl font-mono font-bold text-accent tabular-nums">
            ${fmtDecimal.format(btc)}
          </span>
          {mode === "manual" && !isYouth && (
            <label className="flex flex-col gap-1 mt-1">
              <span className="sr-only">Manual BTC/USD override</span>
              <input
                type="number"
                value={manual.BTC_USD}
                onChange={(e) => setManual((p) => ({ ...p, BTC_USD: Number(e.target.value) || 0 }))}
                className="w-full bg-background border border-border px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>
          )}
        </div>
      </div>

      {isYouth && (
        <div className="px-4 py-2.5 text-[10px] font-mono text-destructive border-t border-destructive/20 bg-destructive/5">
          Youth Safety Mode active -- manual override disabled.
        </div>
      )}
    </section>
  )
}
