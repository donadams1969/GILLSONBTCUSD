import type { Metadata } from 'next'
import { AssetReconciliation } from '@/components/dashboard/asset-reconciliation'

export const metadata: Metadata = {
  title: 'VALORAIPLUS // Asset Management Dashboard',
  description:
    'Asset reconciliation and forensic audit console for active claim management.',
}

export default function AssetsPage() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 text-balance">
            VALORAIPLUS // Asset Management
          </h1>
          <div className="rounded border border-emerald-900 bg-zinc-900 px-3 py-1 font-mono text-xs text-emerald-500">
            ST. PAUL NODE // STATUS: SECURE
          </div>
        </header>

        <AssetReconciliation />
      </div>
    </main>
  )
}
