'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Fingerprint, CheckCircle2, AlertTriangle, Loader2, Link2 } from 'lucide-react'

interface TokenIntegrity {
  id: string
  symbol: string
  name: string
  token_type: string
  status: string
  total_supply_cap: string
  asserted_unit_value_usd: string
  unit_value_status: string
  token_hash: string
  anchored_hash: string
  consistency: string
}

interface IntegrityResponse {
  ok: boolean
  state?: string
  stop_code?: string
  message?: string
  check_type?: string
  node?: string
  chip_id?: string
  chip_hash?: string
  token_count?: number
  total_supply_cap?: string
  chain_root_hash?: string
  records?: TokenIntegrity[]
  realizable_market_value_usd?: string
  peg_status?: string
  disclaimer?: string
  verified_at_iso8601?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function IntegrityVerifier() {
  const { data, error, isLoading } = useSWR<IntegrityResponse>(
    '/api/tokens/integrity',
    fetcher
  )

  return (
    <Card className="border-cyan-500/20 bg-zinc-950/60">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-cyan-300">
            <Fingerprint className="h-5 w-5" />
            DETERMINISTIC INTEGRITY VERIFIER
          </CardTitle>
          {data?.ok && (
            <Badge
              variant="outline"
              className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            >
              {data.state === 'CONSISTENCY_VERIFIED' ? 'STRUCTURE CONSISTENT' : data.state}
            </Badge>
          )}
        </div>
        <p className="text-xs leading-relaxed text-zinc-500">
          Reproducible SHA-256 hash chain over the 7 live registry tokens. This is a
          structural consistency check only &mdash; it is{' '}
          <span className="text-amber-400">not a peg attestation, not a reserve audit, and not a USD valuation</span>.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Asserted price disclaimer banner */}
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-[11px] leading-relaxed text-amber-200/90">
            The $1.00 figure below is an <strong>asserted, unbacked</strong> value carried
            in the declaration. There are no audited USD reserves backing these tokens, so
            their realizable market value remains <strong>$0.00</strong>. The hash chain
            proves the records are internally consistent &mdash; not that they have value.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 p-4 font-mono text-xs text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Computing hash chain&hellip;
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 font-mono text-xs text-red-300">
            Failed to load integrity check.
          </div>
        )}

        {data && !data.ok && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 font-mono text-xs text-red-300">
            {data.stop_code ? `${data.stop_code}: ` : ''}
            {data.message ?? 'Integrity check unavailable.'}
          </div>
        )}

        {data?.ok && (
          <>
            {/* Chain root */}
            <div className="rounded-lg border border-cyan-500/20 bg-black/40 p-3">
              <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wide text-zinc-500">
                <Link2 className="h-3.5 w-3.5" />
                Chain Root Hash
              </div>
              <code className="block break-all font-mono text-xs text-cyan-300">
                {data.chain_root_hash}
              </code>
              <div className="mt-2 font-mono text-[11px] text-zinc-600">
                chip_id: {data.chip_id} &middot; tokens: {data.token_count} &middot; node:{' '}
                {data.node}
              </div>
            </div>

            {/* Per-token rows */}
            <div className="grid gap-2">
              {data.records?.map((t) => (
                <div
                  key={t.symbol}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {t.consistency === 'PASS' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      )}
                      <span className="font-mono text-sm font-semibold text-zinc-200">
                        {t.symbol}
                      </span>
                      <span className="text-xs text-zinc-500">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-zinc-700 bg-zinc-800/50 font-mono text-[10px] text-zinc-400"
                      >
                        cap {Number(t.total_supply_cap).toLocaleString()}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-amber-500/30 bg-amber-500/5 font-mono text-[10px] text-amber-300/80"
                      >
                        ${Number(t.asserted_unit_value_usd).toFixed(2)} asserted
                      </Badge>
                    </div>
                  </div>
                  <code className="mt-2 block break-all font-mono text-[11px] text-zinc-500">
                    anchored: {t.anchored_hash}
                  </code>
                </div>
              ))}
            </div>

            <div className="grid gap-1 border-t border-zinc-800 pt-3 text-[11px] leading-relaxed text-zinc-600">
              <div>
                <span className="text-zinc-500">Realizable market value:</span>{' '}
                <span className="text-amber-400">
                  ${data.realizable_market_value_usd} ({data.peg_status})
                </span>
              </div>
              <div>{data.disclaimer}</div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
