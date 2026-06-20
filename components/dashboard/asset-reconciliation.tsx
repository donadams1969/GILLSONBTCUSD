'use client'

import { useState, useCallback } from 'react'
import { Shield, FileWarning, Gavel, ScrollText, CheckCircle, AlertTriangle, Radio } from 'lucide-react'

// Canonical Master Root produced by the live deterministic system over all 59
// exhibits. This is the only root referenced anywhere in the app.
const CANONICAL_ROOT =
  '0d0922805bb9456515ec3dd557cdcb6dbd40d6e788ccb8950ebf166858486f93'

type LogStatus = 'ACTION' | 'ALERT'

interface LogEntry {
  id: number
  time: string
  text: string
  status: LogStatus
}

function timestamp(): string {
  // Honest wall-clock action timestamp (local time, 24h).
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

export function AssetReconciliation() {
  const [log, setLog] = useState<LogEntry[]>([
    {
      id: 0,
      time: timestamp(),
      text: 'Initialized Saint Paul Node audit session',
      status: 'ACTION',
    },
  ])

  const addEntry = useCallback((text: string, status: LogStatus) => {
    setLog((prev) => [
      ...prev,
      { id: prev.length, time: timestamp(), text, status },
    ])
  }, [])

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Claim summary */}
        <section
          aria-labelledby="claim-heading"
          className="rounded-xl border border-zinc-700/50 bg-black/60 backdrop-blur-sm p-6"
        >
          <h2
            id="claim-heading"
            className="text-sm font-mono font-bold text-cyan-400 mb-4 flex items-center gap-2"
          >
            <ScrollText className="h-4 w-4" />
            ACTIVE CLAIM
          </h2>
          <dl className="space-y-3 text-sm leading-relaxed">
            <div className="flex items-start justify-between gap-3">
              <dt className="text-zinc-500">Status</dt>
              <dd className="text-amber-400 text-right font-medium">
                Under Appeal (Subrogation Requested)
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-zinc-500">Insurer</dt>
              <dd className="text-zinc-200 text-right">State Farm</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-zinc-500">Third-Party</dt>
              <dd className="text-zinc-200 text-right text-pretty">
                Glen Cove Marina / Simms Group
              </dd>
            </div>
          </dl>
        </section>

        {/* Reconciliation actions */}
        <section
          aria-labelledby="actions-heading"
          className="lg:col-span-2 rounded-xl border border-zinc-700/50 bg-black/60 backdrop-blur-sm p-6"
        >
          <h2
            id="actions-heading"
            className="text-sm font-mono font-bold text-emerald-400 mb-4 flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            ASSET RECONCILIATION ACTIONS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() =>
                addEntry('Evidence preservation notice recorded', 'ACTION')
              }
              className="group flex flex-col gap-1 rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 text-left transition hover:border-emerald-600/60 hover:bg-zinc-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span className="flex items-center gap-2 font-bold text-zinc-100">
                <FileWarning className="h-4 w-4 text-emerald-400" />
                Preserve Evidence
              </span>
              <span className="text-xs text-zinc-400">
                Marina Management Notice
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                addEntry('State Farm appeal registered (liability escalation)', 'ALERT')
              }
              className="group flex flex-col gap-1 rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 text-left transition hover:border-amber-600/60 hover:bg-zinc-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <span className="flex items-center gap-2 font-bold text-zinc-100">
                <Gavel className="h-4 w-4 text-amber-400" />
                State Farm Appeal
              </span>
              <span className="text-xs text-zinc-400">Liability Escalation</span>
            </button>
          </div>

          <p className="mt-4 text-xs text-zinc-500 leading-relaxed text-pretty">
            Actions are recorded to the audit log below as timestamped events.
            They are bound to the canonical evidence Master Root but do not
            themselves perform a new cryptographic verification.
          </p>
        </section>
      </div>

      {/* Forensic audit log */}
      <section
        aria-labelledby="log-heading"
        className="rounded-xl border border-zinc-700/50 bg-black/60 backdrop-blur-sm p-6"
      >
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h2
            id="log-heading"
            className="text-sm font-mono font-bold text-zinc-300 flex items-center gap-2"
          >
            <Radio className="h-4 w-4 text-cyan-400" />
            FORENSIC AUDIT LOG
          </h2>
          <span className="font-mono text-[10px] text-zinc-500 break-all">
            ROOT {CANONICAL_ROOT.slice(0, 12)}…{CANONICAL_ROOT.slice(-8)}
          </span>
        </div>
        <div
          role="log"
          aria-live="polite"
          className="h-48 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 font-mono text-xs"
        >
          {log.map((entry) => (
            <div key={entry.id} className="flex items-start gap-2 py-1">
              {entry.status === 'ALERT' ? (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <span className="text-zinc-500">[{entry.time}]</span>
              <span className="text-zinc-300 text-pretty">{entry.text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
