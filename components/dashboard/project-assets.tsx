'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ProjectAsset } from '@/lib/types/database'
import { Coins, Lock, ShieldCheck, Loader2, Network } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatUsd(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(n)
}

function formatNum(n: number) {
  return new Intl.NumberFormat('en-US').format(n)
}

function shortenHash(hash: string | null) {
  if (!hash) return '—'
  if (hash.length <= 18) return hash
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`
}

export function ProjectAssets() {
  const { data, isLoading } = useSWR<{ assets: ProjectAsset[] }>(
    '/api/assets',
    fetcher,
  )

  const assets = data?.assets ?? []
  const totalValue = assets.reduce(
    (sum, a) => sum + Number(a.balance) * Number(a.price_usd),
    0,
  )

  return (
    <Card className="border-cyan-500/30 bg-black/60 backdrop-blur-sm">
      <CardHeader className="border-b border-cyan-500/20">
        <CardTitle className="flex flex-col gap-4 text-cyan-400 font-mono sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            PROJECT ASSETS
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              {assets.length} ASSETS
            </Badge>
            <span className="text-sm text-zinc-400">
              Holdings{' '}
              <span className="font-bold text-emerald-400">
                {formatUsd(totalValue)}
              </span>
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-zinc-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="font-mono text-sm">Loading assets...</span>
          </div>
        ) : assets.length === 0 ? (
          <div className="py-10 text-center font-mono text-sm text-zinc-500">
            No project assets registered.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {assets.map((a) => {
              const isPrimary = a.role.toUpperCase() === 'PRIMARY'
              return (
                <div
                  key={a.id}
                  className={`rounded-lg border p-4 ${
                    isPrimary
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : 'border-cyan-500/30 bg-cyan-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2 ${
                          isPrimary
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-cyan-500/20 text-cyan-400'
                        }`}
                      >
                        <Coins className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-mono text-base font-bold text-zinc-100">
                          {a.symbol}
                        </div>
                        <div className="font-mono text-xs text-zinc-500">
                          {a.name}
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={
                        isPrimary
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                      }
                    >
                      {a.role}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-zinc-500">Balance</div>
                      <div className="font-mono text-sm font-bold text-zinc-100">
                        {formatNum(Number(a.balance))}
                      </div>
                      <div className="font-mono text-xs text-zinc-500">
                        {a.symbol}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Value</div>
                      <div className="font-mono text-sm font-bold text-emerald-400">
                        {formatUsd(Number(a.balance) * Number(a.price_usd))}
                      </div>
                      <div className="font-mono text-xs text-zinc-500">
                        @ {formatUsd(Number(a.price_usd))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-zinc-700/50 pt-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Lock className="h-3 w-3" /> Integration
                      </span>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                        {a.integration_status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Network className="h-3 w-3" /> Node
                      </span>
                      <code className="font-mono text-xs text-zinc-400">
                        {a.node_id ?? '—'}
                      </code>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <ShieldCheck className="h-3 w-3" /> Merkle Root
                      </span>
                      <code className="font-mono text-xs text-cyan-400">
                        {shortenHash(a.merkle_root)}
                      </code>
                    </div>
                    {a.system_state && (
                      <div className="mt-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-1.5 text-center font-mono text-[10px] tracking-wider text-emerald-400">
                        {a.system_state}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
