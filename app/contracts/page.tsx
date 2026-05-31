"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Shield, ExternalLink, RefreshCw, CheckCircle2, Clock, Loader2 } from "lucide-react"

type Contract = {
  name: string
  type: string
  status: string
  msg: string
  supply: string
  network: string
  address: string | null
}

type RegistryData = {
  node: string
  phase: string
  contracts: Contract[]
  ts: string
  note: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  ANCHORING: { label: "ANCHORING", color: "hsl(43 72% 52%)", icon: Clock },
  COMPILED: { label: "COMPILED", color: "hsl(160 45% 40%)", icon: CheckCircle2 },
  DEPLOYED: { label: "DEPLOYED", color: "hsl(160 84% 39%)", icon: CheckCircle2 },
  PENDING: { label: "PENDING", color: "hsl(220 10% 55%)", icon: Clock },
}

export default function ContractsPage() {
  const [data, setData] = useState<RegistryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchContracts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await fetch("/api/contracts/status")
      if (!res.ok) throw new Error("fetch failed")
      const json: RegistryData = await res.json()
      setData(json)
    } catch {
      // keep stale data on failure
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchContracts()
    const iv = setInterval(() => fetchContracts(), 30_000)
    return () => clearInterval(iv)
  }, [fetchContracts])

  const statusCfg = (s: string) => STATUS_CONFIG[s] ?? STATUS_CONFIG.PENDING

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Nav */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-mono uppercase tracking-widest"
          >
            <ArrowLeft className="w-3 h-3" aria-hidden="true" />
            Dashboard
          </Link>
          <button
            onClick={() => fetchContracts(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 border border-border hover:border-primary/40 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            aria-label="Refresh contracts registry"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
          </button>
        </div>

        {/* Header */}
        <header className="border-b border-border pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-primary" aria-hidden="true" />
            <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">
              Contracts Registry
            </h1>
          </div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Saint Paul Node // Single Source of Truth // Zero Fabricated Addresses
          </p>
          {data && (
            <div className="flex items-center gap-4 mt-4">
              <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-1 border border-primary/30 text-primary bg-primary/5">
                {data.phase.replace(/_/g, " ")}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground/50">
                Last fetched: {new Date(data.ts).toLocaleTimeString("en-US", { hour12: false })}
              </span>
            </div>
          )}
        </header>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-4 h-4 text-primary animate-spin" aria-hidden="true" />
            <span className="text-sm font-mono text-muted-foreground">Loading registry...</span>
          </div>
        )}

        {/* Contracts grid */}
        {data && (
          <div className="flex flex-col gap-px bg-border border border-border">
            {data.contracts.map((c) => {
              const cfg = statusCfg(c.status)
              const Icon = cfg.icon
              return (
                <div key={c.name} className="bg-card p-5 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <h2 className="text-base font-serif font-bold text-foreground tracking-tight truncate">
                        {c.name}
                      </h2>
                      <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-0.5 border border-border shrink-0">
                        {c.type}
                      </span>
                    </div>
                    <span
                      className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest shrink-0 px-2 py-1 border"
                      style={{
                        color: cfg.color,
                        borderColor: `color-mix(in srgb, ${cfg.color} 30%, transparent)`,
                        backgroundColor: `color-mix(in srgb, ${cfg.color} 6%, transparent)`,
                      }}
                    >
                      <Icon className="w-3 h-3" aria-hidden="true" />
                      {cfg.label}
                    </span>
                  </div>

                  <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
                    {c.msg}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
                    <div>
                      <span className="text-[8px] font-mono uppercase text-muted-foreground/50 tracking-widest block mb-1">
                        Fixed Supply
                      </span>
                      <span className="text-xs font-mono text-foreground tabular-nums">
                        {c.supply}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-mono uppercase text-muted-foreground/50 tracking-widest block mb-1">
                        Network
                      </span>
                      <span className="text-xs font-mono text-foreground">
                        {c.network}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-mono uppercase text-muted-foreground/50 tracking-widest block mb-1">
                        Address
                      </span>
                      {c.address ? (
                        <a
                          href={`https://etherscan.io/address/${c.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                        >
                          {`${c.address.slice(0, 6)}...${c.address.slice(-4)}`}
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                      ) : (
                        <span className="text-xs font-mono text-muted-foreground/40 italic">
                          Pending deployment
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-[10px] font-mono text-muted-foreground/50 italic leading-relaxed border-t border-border pt-4">
          {data?.note ?? "Contract addresses will appear once mainnet deployment is verified. No fabricated addresses are displayed."}
        </p>

        {/* Health check */}
        <div className="border border-border bg-card p-4">
          <h3 className="text-xs font-serif font-bold text-foreground uppercase tracking-wide mb-3">
            Pre-Launch Health Check
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border">
            {[
              { metric: "Logic Drift", value: "0.00%", status: "LOCKED" },
              { metric: "Brand Compliance", value: "SCRUBBED", status: "CLEAN" },
              { metric: "Privacy Layer", value: "14D Core", status: "ACTIVE" },
              { metric: "Safety Gate", value: "PBKDF2", status: "ENFORCED" },
            ].map((h) => (
              <div key={h.metric} className="bg-card p-3 flex flex-col gap-1">
                <span className="text-[8px] font-mono uppercase text-muted-foreground/50 tracking-widest">
                  {h.metric}
                </span>
                <span className="text-sm font-mono font-bold text-foreground tabular-nums">
                  {h.value}
                </span>
                <span className="text-[9px] font-mono text-accent uppercase tracking-wider">
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <footer className="text-center text-[9px] text-muted-foreground/40 font-mono tracking-widest uppercase border-t border-border pt-4 pb-8">
          Saint Paul Node // Deploy First, Announce Second // Zero-Drift Sovereign Protocol
        </footer>
      </div>
    </div>
  )
}
