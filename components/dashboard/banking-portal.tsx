'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type {
  PortalMetric,
  PortalToken,
  PortalCompliance,
  BaseActivity,
  TokenSync,
} from '@/lib/types/database'
import {
  Landmark,
  Coins,
  ShieldCheck,
  Activity,
  Link2,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface PortalData {
  metrics: PortalMetric[]
  tokens: PortalToken[]
  compliance: PortalCompliance[]
  baseActivity: BaseActivity[]
  tokenSync: TokenSync | null
}

interface SealData {
  state: string
  computed_hash?: string
  expected_hash?: string | null
  token_count?: number
  total_supply_cap?: string
  message?: string
  disclaimer?: string
}

interface IntelData {
  ledger_state: string
  bundle_hash: string
  snapshot_hash: string | null
  canonical_hash: string | null
  total_supply_cap: number
  hash_verified: boolean
  status: string
  note: string
  last_sync: string | null
}

export function BankingPortal() {
  const { data } = useSWR<PortalData>('/api/portal', fetcher)
  const { data: seal } = useSWR<SealData>('/api/tokens/sync', fetcher)
  const { data: intel } = useSWR<IntelData>('/api/portal/intelligence', fetcher)

  const metrics = data?.metrics ?? []
  const tokens = data?.tokens ?? []
  const compliance = data?.compliance ?? []
  const baseActivity = data?.baseActivity ?? []

  const primaryTokens = tokens.filter((t) => t.category === 'PRIMARY')
  const secondaryTokens = tokens.filter((t) => t.category === 'SECONDARY')

  const sealVerified = seal?.state === 'SEAL_VERIFIED'

  return (
    <div className="space-y-8">
      {/* KPI Metrics */}
      <Card className="border-cyan-500/30 bg-black/60 backdrop-blur-sm">
        <CardHeader className="border-b border-cyan-500/20">
          <CardTitle className="flex items-center gap-2 font-mono text-cyan-400">
            <Landmark className="h-5 w-5" />
            VALOR AI+ BANKING PORTAL — FINANCIAL INTELLIGENCE
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {metrics.map((m) => (
              <div
                key={m.key}
                className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4"
              >
                <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                  {m.label}
                </div>
                <div className="mt-1 font-mono text-2xl font-bold text-zinc-100">
                  {m.unit === 'B' || m.unit === 'M' ? '$' : ''}
                  {m.value}
                  {m.unit && m.unit !== '%' ? '' : m.unit}
                  {m.unit === 'B' ? 'B' : m.unit === 'M' ? 'M' : ''}
                </div>
                <div className="mt-1 font-mono text-[10px] text-emerald-400">
                  {m.status}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Base posture strip + token-sync seal */}
      <Card className="border-amber-500/30 bg-black/60 backdrop-blur-sm">
        <CardHeader className="border-b border-amber-500/20">
          <CardTitle className="flex items-center gap-2 font-mono text-amber-400">
            <Activity className="h-5 w-5" />
            BASE RAIL POSTURE
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <PostureChip
              label="BASE_RAIL_LIVE"
              tone="emerald"
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            />
            <PostureChip
              label="WALLET_ACTIVITY_CONFIRMED"
              tone="emerald"
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            />
            <PostureChip
              label={sealVerified ? 'TOKEN_SYNC_SEAL_VERIFIED' : 'TOKEN_SYNC_SEAL_BLOCKED'}
              tone={sealVerified ? 'emerald' : 'amber'}
              icon={
                sealVerified ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )
              }
            />
          </div>

          {/* Honest seal detail */}
          <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <div className="flex items-center gap-2 font-mono text-xs text-amber-400">
              <Lock className="h-3.5 w-3.5" />
              TOKEN SUPPLY-CAP SEAL ({seal?.state ?? 'LOADING'})
            </div>
            <p className="mt-2 font-mono text-xs leading-relaxed text-zinc-400">
              {seal?.message ??
                'Computing canonical registry hash from ground truth...'}
            </p>
            {seal?.computed_hash && (
              <div className="mt-2 break-all rounded-md border border-zinc-700/60 bg-zinc-950/80 px-3 py-2 font-mono text-[10px] text-zinc-400">
                <span className="text-zinc-500">computed_hash: </span>
                {seal.computed_hash}
              </div>
            )}
            {seal?.disclaimer && (
              <p className="mt-2 font-mono text-[10px] italic leading-relaxed text-zinc-600">
                {seal.disclaimer}
              </p>
            )}
          </div>

          {/* Forensic anchor (Omni-Kodex) */}
          {intel && (
            <div className="mt-4 rounded-lg border border-zinc-700/60 bg-zinc-950/80 p-3">
              <div className="flex items-center justify-between font-mono text-xs text-zinc-300">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                  VALORAIPLUS FORENSIC ANCHOR
                </span>
                <span className="text-zinc-500">
                  ledger {intel.ledger_state} · cap{' '}
                  {Number(intel.total_supply_cap).toLocaleString()}
                </span>
              </div>
              <div className="mt-2 space-y-1.5">
                <AnchorRow label="bundle_hash" value={intel.bundle_hash} />
                <AnchorRow label="snapshot_hash" value={intel.snapshot_hash} />
                <AnchorRow
                  label="canonical_hash"
                  value={intel.canonical_hash ?? 'NOT_INJECTED'}
                />
              </div>
              <p className="mt-2 font-mono text-[10px] italic leading-relaxed text-zinc-600">
                {intel.note}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evidence anchors */}
      <Card className="border-cyan-500/30 bg-black/60 backdrop-blur-sm">
        <CardHeader className="border-b border-cyan-500/20">
          <CardTitle className="flex items-center gap-2 font-mono text-cyan-400">
            <Link2 className="h-5 w-5" />
            ONCHAIN EVIDENCE ANCHORS — BASESCAN
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {baseActivity.length === 0 ? (
            <p className="py-6 text-center font-mono text-sm text-zinc-500">
              No evidence anchors recorded.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-zinc-500">
                    <th className="py-2 pr-4 font-medium">DIRECTION</th>
                    <th className="py-2 pr-4 font-medium">TYPE</th>
                    <th className="py-2 pr-4 font-medium">ANCHOR</th>
                    <th className="py-2 pr-4 font-medium">LABEL</th>
                    <th className="py-2 font-medium">LINK</th>
                  </tr>
                </thead>
                <tbody>
                  {baseActivity.map((a) => (
                    <tr key={a.id} className="border-b border-zinc-900">
                      <td className="py-2 pr-4">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            a.direction === 'INBOUND'
                              ? 'text-emerald-400'
                              : 'text-orange-400'
                          }`}
                        >
                          {a.direction === 'INBOUND' ? (
                            <ArrowDownLeft className="h-3 w-3" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3" />
                          )}
                          {a.direction}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-zinc-400">{a.anchor_type}</td>
                      <td className="max-w-[220px] truncate py-2 pr-4 text-zinc-300">
                        {a.evidence_anchor}
                      </td>
                      <td className="py-2 pr-4 text-zinc-400">{a.label}</td>
                      <td className="py-2">
                        {a.explorer_url ? (
                          <a
                            href={a.explorer_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Token ecosystem */}
      <Card className="border-emerald-500/30 bg-black/60 backdrop-blur-sm">
        <CardHeader className="border-b border-emerald-500/20">
          <CardTitle className="flex items-center justify-between font-mono text-emerald-400">
            <span className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              TOKEN ECOSYSTEM
            </span>
            <Badge className="border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
              {tokens.length} TOKENS
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-2 font-mono text-xs uppercase tracking-wide text-zinc-500">
            Primary (with market cap)
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {primaryTokens.map((t) => (
              <div
                key={t.symbol}
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3"
              >
                <div className="font-mono text-sm font-bold text-zinc-100">
                  {t.symbol}
                </div>
                <div className="font-mono text-xs text-emerald-400">
                  ${Number(t.market_cap_b).toFixed(1)}B
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 mb-2 font-mono text-xs uppercase tracking-wide text-zinc-500">
            Secondary
          </div>
          <div className="flex flex-wrap gap-2">
            {secondaryTokens.map((t) => (
              <span
                key={t.symbol}
                className="rounded-md border border-zinc-700/60 bg-zinc-950/80 px-2 py-1 font-mono text-xs text-zinc-300"
              >
                {t.symbol}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance */}
      <Card className="border-cyan-500/30 bg-black/60 backdrop-blur-sm">
        <CardHeader className="border-b border-cyan-500/20">
          <CardTitle className="flex items-center gap-2 font-mono text-cyan-400">
            <ShieldCheck className="h-5 w-5" />
            FEDERAL COMPLIANCE STATUS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {compliance.map((c) => (
              <div
                key={c.agency}
                className="flex items-center justify-between rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3"
              >
                <div>
                  <div className="font-mono text-sm font-bold text-zinc-100">
                    {c.agency}
                  </div>
                  <div className="font-mono text-[10px] text-zinc-500">
                    {c.framework}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
                    {c.status}
                  </Badge>
                  {c.expiration && (
                    <div className="mt-1 font-mono text-[10px] text-zinc-500">
                      exp {c.expiration}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AnchorRow({
  label,
  value,
}: {
  label: string
  value: string | null
}) {
  return (
    <div className="break-all font-mono text-[10px] text-zinc-400">
      <span className="text-zinc-500">{label}: </span>
      {value ?? '—'}
    </div>
  )
}

function PostureChip({
  label,
  tone,
  icon,
}: {
  label: string
  tone: 'emerald' | 'amber'
  icon: React.ReactNode
}) {
  const tones = {
    emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-xs ${tones[tone]}`}
    >
      {icon}
      {label}
    </span>
  )
}
