'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ConnectedWallet } from '@/lib/types/database'
import {
  connectWallet,
  fetchEthUsdPrice,
  isWalletAvailable,
  type WalletProviderId,
} from '@/lib/wallet/connect'
import {
  Wallet,
  Trash2,
  Copy,
  Check,
  Plus,
  Loader2,
  AlertTriangle,
} from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const PROVIDERS: { id: WalletProviderId; label: string; color: string }[] = [
  { id: 'MetaMask', label: 'MetaMask', color: 'text-orange-400' },
  { id: 'Coinbase', label: 'Coinbase', color: 'text-blue-400' },
  { id: 'Phantom', label: 'Phantom', color: 'text-indigo-400' },
  { id: 'Ledger', label: 'Ledger', color: 'text-zinc-300' },
  { id: 'Uniswap', label: 'Uniswap', color: 'text-pink-400' },
]

function shorten(address: string) {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatUsd(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function ConnectedWallets() {
  const { data, isLoading, mutate } = useSWR<{ wallets: ConnectedWallet[] }>(
    '/api/wallets',
    fetcher,
  )
  const [connecting, setConnecting] = useState<WalletProviderId | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const wallets = data?.wallets ?? []
  const totalUsd = wallets.reduce((sum, w) => sum + Number(w.balance_usd), 0)

  async function handleConnect(provider: WalletProviderId) {
    setError(null)
    if (!isWalletAvailable()) {
      setError(
        'No browser wallet detected. Install MetaMask or another EIP-1193 wallet to connect live.',
      )
      return
    }
    setConnecting(provider)
    try {
      const result = await connectWallet(provider)
      const price = await fetchEthUsdPrice()
      const balanceUsd = result.nativeBalance * price

      const res = await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          chain: 'evm',
          wallet_address: result.address,
          native_symbol: result.symbol,
          native_balance: result.nativeBalance,
          balance_usd: balanceUsd,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? 'Failed to save wallet')
      }
      await mutate()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed')
    } finally {
      setConnecting(null)
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/wallets/${id}`, { method: 'DELETE' })
    await mutate()
  }

  async function handleCopy(address: string) {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(address)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <Card className="border-cyan-500/30 bg-black/60 backdrop-blur-sm">
      <CardHeader className="border-b border-cyan-500/20">
        <CardTitle className="flex flex-col gap-4 text-cyan-400 font-mono sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            CONNECTED WALLETS
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              {wallets.length} CONNECTED
            </Badge>
            <span className="text-sm text-zinc-400">
              Total{' '}
              <span className="font-bold text-emerald-400">
                {formatUsd(totalUsd)}
              </span>
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        {/* Connect controls */}
        <div className="mb-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Plus className="h-3.5 w-3.5" />
            CONNECT A LIVE WALLET
          </div>
          <div className="flex flex-wrap gap-2">
            {PROVIDERS.map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant="outline"
                disabled={connecting !== null}
                onClick={() => handleConnect(p.id)}
                className="border-cyan-500/30 bg-black/40 font-mono text-xs hover:bg-cyan-500/10"
              >
                {connecting === p.id ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wallet className={`mr-1.5 h-3.5 w-3.5 ${p.color}`} />
                )}
                {p.label}
              </Button>
            ))}
          </div>
          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-400">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Wallet list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-zinc-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="font-mono text-sm">Loading wallets...</span>
          </div>
        ) : wallets.length === 0 ? (
          <div className="py-10 text-center font-mono text-sm text-zinc-500">
            No wallets connected yet. Use the controls above to connect a live
            wallet.
          </div>
        ) : (
          <div className="grid gap-3">
            {wallets.map((w) => (
              <div
                key={w.id}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-cyan-500/20 p-2 text-cyan-400">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-mono text-sm font-semibold text-zinc-100">
                        {w.provider}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-emerald-400">
                        <Check className="h-3 w-3" /> Connected
                      </div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(w.id)}
                    className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    aria-label={`Disconnect ${w.provider} wallet`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3">
                  <div className="text-xs text-zinc-500">Wallet Address</div>
                  <div className="mt-1 flex items-center gap-2 rounded-md border border-zinc-700/60 bg-zinc-950/80 px-3 py-2">
                    <code className="flex-1 truncate font-mono text-xs text-zinc-300">
                      {w.wallet_address}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleCopy(w.wallet_address)}
                      className="h-7 w-7 text-cyan-400 hover:bg-cyan-500/10"
                      aria-label="Copy wallet address"
                    >
                      {copied === w.wallet_address ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-zinc-500">Balance</div>
                    <div className="font-mono text-lg font-bold text-zinc-100">
                      {formatUsd(Number(w.balance_usd))}
                    </div>
                    <div className="font-mono text-xs text-zinc-500">
                      {Number(w.native_balance).toFixed(4)} {w.native_symbol}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">Last Updated</div>
                    <div className="font-mono text-xs text-zinc-400">
                      {new Date(w.last_updated).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
