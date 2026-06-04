'use client'

import { CheckCircle, Clock, AlertTriangle, Info } from 'lucide-react'

const AUDIT_LOG = [
  { id: 1, time: 'Just Now',   tag: 'SAINT_PAUL',    text: 'Merkleroot lock verified on block 101010-1010101',                              status: 'SUCCESS' },
  { id: 2, time: '2 min ago',  tag: 'SF_DEPT12',     text: 'Emergency TRO filed & bound via RapidLegal (EFILING_7226_43)',                  status: 'ALERT'   },
  { id: 3, time: '5 min ago',  tag: 'SAC_DRE',       text: 'Unlicensed broker activity alert transmitted to DRE investigators',             status: 'WARNING' },
  { id: 4, time: '12 min ago', tag: 'SYSTEM_SHIELD', text: 'N.E.W.T. (Written/Digital-only) communications mandate enforced',              status: 'SUCCESS' },
  { id: 5, time: '25 min ago', tag: 'AMATH_ENGINE',  text: 'Navier-Stokes fluid boundaries stable. Residual drift: 0.000000',              status: 'SUCCESS' },
]

const COMPLIANCE = [
  { name: 'N.E.W.T. ADA Compliance',        rate: 98, status: 'Active Shielding',        from: 'from-cyan-500',    to: 'to-blue-600'   },
  { name: 'B&P §10130 Broker Audit',        rate: 87, status: 'Landrum License Flagged', from: 'from-emerald-500', to: 'to-teal-600'   },
  { name: 'VR&E Track 4 Entrepreneur Plan', rate: 94, status: 'Feasibility Validated',   from: 'from-amber-500',   to: 'to-orange-600' },
  { name: 'State Farm Privacy Counter',     rate: 76, status: 'Probes Intercepted',       from: 'from-red-500',     to: 'to-rose-600'   },
]

const STATUS_ICON: Record<string, React.ReactNode> = {
  SUCCESS: <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />,
  ALERT:   <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />,
  WARNING: <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />,
  INFO:    <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />,
}

const TAG_COLORS: Record<string, string> = {
  SAINT_PAUL:    'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  SF_DEPT12:     'text-amber-400 bg-amber-500/10 border-amber-500/20',
  SAC_DRE:       'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  SYSTEM_SHIELD: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  AMATH_ENGINE:  'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

export function AuditLog() {
  return (
    <div className="rounded-xl border border-zinc-700/50 bg-black/60 backdrop-blur-sm p-5">
      <h2 className="text-sm font-mono font-bold text-cyan-400 mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        LIVE AUDIT LOG
      </h2>
      <div className="space-y-2">
        {AUDIT_LOG.map(entry => (
          <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/50">
            {STATUS_ICON[entry.status]}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${TAG_COLORS[entry.tag] ?? 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
                  {entry.tag}
                </span>
                <span className="text-xs text-zinc-600 font-mono">{entry.time}</span>
              </div>
              <p className="text-xs text-zinc-300 font-mono leading-relaxed">{entry.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ComplianceBars() {
  return (
    <div className="rounded-xl border border-zinc-700/50 bg-black/60 backdrop-blur-sm p-5">
      <h2 className="text-sm font-mono font-bold text-cyan-400 mb-4 flex items-center gap-2">
        <CheckCircle className="h-4 w-4" />
        COMPLIANCE CAMPAIGNS
      </h2>
      <div className="space-y-4">
        {COMPLIANCE.map(c => (
          <div key={c.name}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-mono text-zinc-300">{c.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-500">{c.status}</span>
                <span className="text-xs font-mono font-bold text-white">{c.rate}%</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${c.from} ${c.to} transition-all duration-700`}
                style={{ width: `${c.rate}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
