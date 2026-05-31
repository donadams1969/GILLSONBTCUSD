"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Shield } from "lucide-react"

export function Header() {
  const [prices, setPrices] = useState<Record<string, number>>({
    LEG1904: 4135,
    DONNY: 110.98,
    JAXX: 110.98,
    GILLGOLD: 2745.5,
    GILLBTC: 98420,
    XAU_USD: 4135,
    BTC_USD: 98420,
  })

  useEffect(() => {
    let alive = true
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/oracle/prices")
        if (!res.ok) return
        const data = await res.json()
        if (alive) setPrices(data.prices)
      } catch { /* silent */ }
    }
    fetchPrices()
    const iv = setInterval(fetchPrices, 10_000)
    return () => { alive = false; clearInterval(iv) }
  }, [])

  const fmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      {/* Ticker tape */}
      <div className="overflow-hidden bg-background border-b border-border" role="marquee" aria-label="Live sovereign token prices">
        <div className="ticker-animate flex whitespace-nowrap py-1" aria-hidden="true">
          {[...Array(2)].map((_, rep) => (
            <span key={rep} className="flex gap-8 px-4 text-[10px] font-mono text-muted-foreground">
              <span>$LEG1904 <span className="text-primary">{fmt.format(prices.LEG1904)}</span></span>
              <span className="text-border">|</span>
              <span>$DONNY <span className="text-primary">{fmt.format(prices.DONNY)}</span></span>
              <span className="text-border">|</span>
              <span>$JAXX <span className="text-accent">{fmt.format(prices.JAXX)}</span></span>
              <span className="text-border">|</span>
              <span>$GILLGOLD <span className="text-primary">{fmt.format(prices.GILLGOLD)}</span></span>
              <span className="text-border">|</span>
              <span>$GILLBTC <span className="text-[hsl(25,70%,50%)]">{fmt.format(prices.GILLBTC)}</span></span>
              <span className="text-border">|</span>
              <span>XAU/USD <span className="text-primary">{fmt.format(prices.XAU_USD)}</span></span>
              <span className="text-border">|</span>
              <span>BTC/USD <span className="text-[hsl(25,70%,50%)]">{fmt.format(prices.BTC_USD)}</span></span>
              <span className="text-border mx-4">{"///"}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main header bar */}
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" aria-hidden="true" />
          <div className="flex items-baseline gap-3">
            <h1 className="text-lg font-serif font-bold tracking-tight text-foreground">
              VALORAIPLUS
            </h1>
            <span className="text-[10px] font-mono text-muted-foreground tracking-widest hidden sm:inline">
              V1 SOVEREIGN STACK
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1" aria-label="Utility navigation">
            <Link
              href="/safety"
              className="px-3 py-1.5 border border-border hover:border-primary/40 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Safety
            </Link>
            <Link
              href="/contracts"
              className="px-3 py-1.5 border border-border hover:border-primary/40 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Contracts
            </Link>
            <Link
              href="/audit"
              className="px-3 py-1.5 border border-border hover:border-primary/40 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Audit
            </Link>
          </nav>

          <div className="h-6 w-px bg-border hidden md:block" />

          <div className="hidden md:flex items-center gap-2" aria-live="polite" aria-atomic="true">
            <span className="w-1.5 h-1.5 bg-accent animate-pulse" aria-hidden="true" />
            <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-bold">
              LIVE
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              0xA3F7...D91E
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
