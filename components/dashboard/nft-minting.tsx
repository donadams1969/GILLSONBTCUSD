'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card } from '@/components/ui/card'

interface NFTAsset {
  id: number
  token_id: string | null
  owner_wallet: string | null
  asset_name: string | null
  authority_status: string | null
  hardware_signature: string | null
  value_complexity_index: number | null
  uci_tether: number | null
  mint_status: string | null
  waterfall_verified: boolean
  tx_hash: string | null
  created_at: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function NFTMinting() {
  const { data, isLoading, mutate } = useSWR<{ nfts: NFTAsset[] }>(
    '/api/nft/mint',
    fetcher,
    { refreshInterval: 5000 }
  )
  const [isCreating, setIsCreating] = useState(false)
  const [hwSignature, setHwSignature] = useState('')

  const handleMint = async () => {
    if (!hwSignature.trim()) return
    setIsCreating(true)

    try {
      const response = await fetch('/api/nft/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_wallet: 'donadams1969.eth',
          hardware_signature: hwSignature,
          asset_name: `VALORAIPLUS® NFT #${hwSignature}`,
          value_complexity_index: 10.45,
          provenance: 'SAINT_PAUL_NODE_2207',
        }),
      })

      if (response.ok) {
        setHwSignature('')
        mutate()
      }
    } catch (error) {
      console.error('[v0] Mint error:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 border border-cyan-500/30 bg-gradient-to-br from-slate-950 to-slate-900">
        <h3 className="text-lg font-bold text-cyan-400 mb-4">🔐 VALORAIPLUS® NFT Minting Protocol</h3>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-amber-400 block mb-2">Hardware Signature (0UAK...)</label>
            <input
              type="text"
              value={hwSignature}
              onChange={e => setHwSignature(e.target.value)}
              placeholder="e.g., 0UAK57S1BT"
              className="w-full px-3 py-2 bg-slate-800 border border-cyan-500/20 rounded text-white text-sm font-mono"
              disabled={isCreating}
            />
          </div>

          <button
            onClick={handleMint}
            disabled={isCreating || !hwSignature.trim()}
            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white rounded font-mono text-sm transition"
          >
            {isCreating ? '⏳ Minting...' : '▶ MINT SOVEREIGN NFT'}
          </button>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-amber-400">Minted Assets ({data?.nfts?.length || 0})</h3>

        {isLoading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : !data?.nfts?.length ? (
          <p className="text-slate-500 text-sm">No NFTs minted yet</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.nfts.map(nft => (
              <div
                key={nft.id}
                className="p-3 bg-slate-800 border border-cyan-500/20 rounded text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-cyan-400">{nft.token_id ?? nft.asset_name ?? `NFT #${nft.id}`}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      nft.waterfall_verified
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-yellow-900/30 text-yellow-400'
                    }`}
                  >
                    {nft.authority_status ?? 'PENDING'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-amber-400">Owner:</span>{' '}
                    <span className="font-mono">{nft.owner_wallet ?? 'unassigned'}</span>
                  </div>
                  <div>
                    <span className="text-amber-400">HW:</span>{' '}
                    <span className="font-mono">{nft.hardware_signature ?? '—'}</span>
                  </div>
                  <div>
                    <span className="text-amber-400">UCI Tether:</span> $
                    {Number(nft.uci_tether ?? 0).toLocaleString()}
                  </div>
                  <div>
                    <span className="text-amber-400">Status:</span>{' '}
                    <span className="text-cyan-300">{nft.mint_status ?? 'PENDING'}</span>
                  </div>
                </div>
                <div className="mt-2 text-slate-400 font-mono text-xs">
                  TxHash: {nft.tx_hash ? `${nft.tx_hash.substring(0, 20)}...` : 'not yet broadcast'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
