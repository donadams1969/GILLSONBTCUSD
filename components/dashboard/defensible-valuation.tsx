'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Scale, Code2, Coins, LinkIcon, ShieldCheck, AlertTriangle } from 'lucide-react'

type Confidence = 'verified' | 'estimate' | 'zero'

interface ValuationLine {
  label: string
  icon: React.ComponentType<{ className?: string }>
  value: string
  confidence: Confidence
  basis: string
}

const VALUATION_LINES: ValuationLine[] = [
  {
    label: 'Software Replacement Cost',
    icon: Code2,
    value: '$40,000 – $55,000 USD',
    confidence: 'estimate',
    basis:
      'Engineering rebuild estimate (range $39,400–$53,500) at US/EU blended contractor rates to recreate the Next.js app, Supabase schema, RLS, API layer, and anchor verification logic. This is a cost-to-rebuild, not a market valuation.',
  },
  {
    label: 'Token Registry — Realizable Market Value',
    icon: Coins,
    value: '$0.00 USD',
    confidence: 'zero',
    basis:
      '686,626,710 total supply cap across 7 tokens. No exchange listing, no trading pair, no liquidity, and no backing reserves. A supply cap is a maximum quantity, not a price, so no defensible USD figure exists above $0.',
  },
  {
    label: 'Bitcoin Mainnet Anchor',
    icon: LinkIcon,
    value: 'STOP_TX_NOT_FOUND',
    confidence: 'zero',
    basis:
      'TXID 26856b24…75c2 returns 404 across independent block explorers (Blockstream and mempool.space, mainnet and testnet). Unanchored placeholder — contributes $0 of provable value and must not be presented as verified.',
  },
]

const CONFIDENCE_META: Record<
  Confidence,
  { label: string; badge: string; valueColor: string }
> = {
  verified: {
    label: 'VERIFIED',
    badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    valueColor: 'text-emerald-400',
  },
  estimate: {
    label: 'ESTIMATE',
    badge: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
    valueColor: 'text-cyan-300',
  },
  zero: {
    label: 'NO MARKET VALUE',
    badge: 'border-red-500/40 bg-red-500/10 text-red-400',
    valueColor: 'text-red-300',
  },
}

export function DefensibleValuation() {
  return (
    <Card className="border-cyan-500/20 bg-black/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-mono text-cyan-400">
          <Scale className="h-5 w-5" />
          DEFENSIBLE VALUATION MATRIX
        </CardTitle>
        <p className="font-mono text-xs text-zinc-500">
          Reconciled to verifiable engineering metrics only. Unadjudicated commercial layers excluded.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Posture banner */}
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <p className="font-mono text-[11px] leading-relaxed text-emerald-300/90">
            TRUTHFUL ENGINEERING BASE INGESTED. Narrative frequency designations, treasury ingestion
            claims, and unverified debt layers have been stripped from this matrix.
          </p>
        </div>

        {/* Valuation lines */}
        <div className="grid gap-3">
          {VALUATION_LINES.map((line) => {
            const meta = CONFIDENCE_META[line.confidence]
            const Icon = line.icon
            return (
              <div
                key={line.label}
                className="rounded-lg border border-zinc-700/40 bg-zinc-900/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-zinc-400" />
                    <span className="font-mono text-sm text-zinc-200">{line.label}</span>
                  </div>
                  <Badge className={`shrink-0 font-mono text-[10px] ${meta.badge}`}>
                    {meta.label}
                  </Badge>
                </div>
                <div className={`mt-2 font-mono text-lg font-bold ${meta.valueColor}`}>
                  {line.value}
                </div>
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-zinc-500">
                  {line.basis}
                </p>
              </div>
            )
          })}
        </div>

        {/* Honest bottom-line */}
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
          <div className="font-mono text-xs text-zinc-400">PRACTICAL BOTTOM LINE</div>
          <div className="mt-1 font-mono text-sm leading-relaxed text-zinc-200">
            Realizable market value of tokens and anchor: <span className="text-red-300">$0.00</span>.
            Engineering replacement cost of the working software:{' '}
            <span className="text-cyan-300">~$40K–$55K USD</span>.
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="font-mono text-[11px] leading-relaxed text-amber-300/90">
            This matrix reflects software cost and verifiable asset status only. It is not legal
            damages, not a regulatory valuation, and not financial advice. Any legal damages figure
            must be prepared by a qualified attorney or damages expert and must not be presented as a
            value &quot;calculated&quot; or &quot;verified&quot; by this system.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
