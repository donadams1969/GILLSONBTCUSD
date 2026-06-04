'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card } from '@/components/ui/card'
import { Anchor, Copy, Check, ShieldCheck, ShieldAlert, Loader2, Link2 } from 'lucide-react'

interface BundleHashResponse {
  ok: boolean
  bundle_hash_sha256?: string
  op_return_payload_hex?: string
  op_return_byte_length?: number
  attestation_id?: string
  node?: string
  case_file?: string
  mandatory_disclaimer?: string
}

interface VerifyResult {
  ok: boolean
  verified?: boolean
  persisted?: boolean
  stop_code?: string
  message?: string
  txid?: string
  block_height?: number
  block_hash?: string
  confirmation_count?: number
  merkle_root?: string
  on_chain_payload?: string
  expected_merkle_root?: string
  anchor_receipt_hash_sha256?: string
  verified_at_iso8601?: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

function Field({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-amber-400">{label}</span>
      <span className={`text-xs text-zinc-300 break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

export function AnchorVerification() {
  const { data: bundle } = useSWR<BundleHashResponse>('/api/anchor/bundle-hash', fetcher)
  const [txid, setTxid] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [copied, setCopied] = useState(false)

  const bundleHash = bundle?.bundle_hash_sha256 ?? ''
  const opReturnScript = bundleHash ? `6a20${bundleHash}` : ''

  const handleCopy = async () => {
    if (!bundleHash) return
    await navigator.clipboard.writeText(bundleHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleVerify = async () => {
    const clean = txid.trim().toLowerCase()
    if (!clean) return
    setVerifying(true)
    setResult(null)
    try {
      const res = await fetch('/api/anchor/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txid: clean, merkle_root: bundleHash }),
      })
      setResult(await res.json())
    } catch (e) {
      setResult({ ok: false, message: (e as Error).message })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <Card className="p-5 border border-cyan-500/30 bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="flex items-center gap-2 mb-4">
        <Anchor className="h-5 w-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-cyan-400">DIRS v2 Bitcoin Anchor Verification</h3>
      </div>

      {/* Bundle hash */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-amber-400">BUNDLE_HASH_SHA256 (OP_RETURN payload)</span>
          <button
            onClick={handleCopy}
            disabled={!bundleHash}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 disabled:text-zinc-600"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="p-3 rounded bg-slate-900 border border-cyan-500/20 font-mono text-xs text-cyan-300 break-all">
          {bundleHash || 'computing…'}
        </div>
        {opReturnScript && (
          <p className="mt-2 text-xs text-zinc-500 font-mono break-all">
            <span className="text-amber-400">scriptPubKey:</span> {opReturnScript}{' '}
            <span className="text-zinc-600">({bundle?.op_return_byte_length ?? 32} bytes)</span>
          </p>
        )}
      </div>

      {/* TXID input */}
      <div className="mb-4">
        <label className="text-xs text-amber-400 block mb-2">Bitcoin TXID (64-char hex)</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={txid}
            onChange={e => setTxid(e.target.value)}
            placeholder="e.g., 26856b24c50750f0…bc8d75c2"
            className="flex-1 px-3 py-2 bg-slate-800 border border-cyan-500/20 rounded text-white text-xs font-mono focus:outline-none focus:border-cyan-500/50"
            disabled={verifying}
          />
          <button
            onClick={handleVerify}
            disabled={verifying || !txid.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white rounded font-mono text-xs transition shrink-0"
          >
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
            {verifying ? 'Verifying…' : 'VERIFY ANCHOR'}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`p-4 rounded border ${
            result.verified
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-red-500/40 bg-red-500/5'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            {result.verified ? (
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-red-400" />
            )}
            <span className={`text-sm font-bold ${result.verified ? 'text-emerald-400' : 'text-red-400'}`}>
              {result.verified ? 'ANCHOR VERIFIED' : result.stop_code ?? 'VERIFICATION FAILED'}
            </span>
          </div>

          {result.message && !result.verified && (
            <p className="text-xs text-red-300 mb-2">{result.message}</p>
          )}

          {result.verified && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Block Height" value={String(result.block_height ?? '—')} />
              <Field label="Confirmations" value={String(result.confirmation_count ?? '—')} />
              <Field label="Block Hash" value={result.block_hash ?? '—'} />
              <Field label="Merkle Root" value={result.merkle_root ?? '—'} />
              <div className="sm:col-span-2">
                <Field label="Anchor Receipt Hash (SHA-256)" value={result.anchor_receipt_hash_sha256 ?? '—'} />
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Persistence"
                  value={result.persisted ? 'Stored in valoraiplus_anchor_receipts' : 'Not stored (receipt tables not yet created)'}
                  mono={false}
                />
              </div>
            </div>
          )}

          {!result.verified && result.on_chain_payload && (
            <div className="mt-2 grid grid-cols-1 gap-2">
              <Field label="On-chain payload" value={result.on_chain_payload} />
              <Field label="Expected" value={result.expected_merkle_root ?? bundleHash} />
            </div>
          )}
        </div>
      )}

      <p className="mt-4 text-[10px] leading-relaxed text-zinc-600">
        {bundle?.mandatory_disclaimer ??
          'Demonstration artifact. Not external certification, bank approval, audit opinion, or solvency verification.'}
      </p>
    </Card>
  )
}
