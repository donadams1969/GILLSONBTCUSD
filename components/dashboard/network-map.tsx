'use client'

import { useState } from 'react'
import { Activity } from 'lucide-react'

const NODES = [
  { id: 'st_paul',          name: 'Saint Paul HQ',          state: 'MN', x: 580, y: 190, type: 'Central Sovereign Hub (Merkleroot Anchor)', status: 'ACTIVE',    load: '2.1%',   metrics: '43/43 Docs Locked',         color: 'cyan',    latency: '14ms' },
  { id: 'sf_dept12',        name: 'San Francisco Edge',      state: 'CA', x: 100, y: 280, type: 'Active Defense Court Edge (CUD-26-682107)', status: 'ACTIVE',    load: '42.7%',  metrics: 'Emergency TRO Active',      color: 'amber',   latency: '42ms' },
  { id: 'sac_dre',          name: 'Sacramento Audit',        state: 'CA', x: 130, y: 220, type: 'DRE Registry Auditing (B&P §10130)',        status: 'ACTIVE',    load: '18.2%',  metrics: 'Licensure Flags Live',      color: 'emerald', latency: '28ms' },
  { id: 'avondale_blockade',name: 'Avondale Sector',         state: 'AZ', x: 240, y: 430, type: 'Nullified Zone / Active Blockade',          status: 'NULLIFIED', load: '0.000%', metrics: 'Access Blocked',            color: 'red',     latency: 'INF'  },
  { id: 'chi_compliance',   name: 'Chicago Compliance',      state: 'IL', x: 640, y: 250, type: 'Federal Agency Routing Interface',          status: 'STANDBY',   load: '1.4%',   metrics: 'N.E.W.T. Secure Gateway',  color: 'cyan',    latency: '35ms' },
  { id: 'atl_oig',          name: 'Atlanta OIG',             state: 'GA', x: 770, y: 450, type: 'HUD-OIG / VA-OIG Regulatory Edge',          status: 'ACTIVE',    load: '12.5%',  metrics: 'Data Breach Audits Tx',     color: 'emerald', latency: '51ms' },
  { id: 'dc_firewall',      name: 'Washington DC Gate',      state: 'DC', x: 880, y: 310, type: 'DOJ Civil Rights Compliance Portal',         status: 'ACTIVE',    load: '5.1%',   metrics: 'ADA Section 504 Lodged',    color: 'cyan',    latency: '62ms' },
]

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  STANDBY:   'text-cyan-400    border-cyan-500/40    bg-cyan-500/10',
  NULLIFIED: 'text-red-400     border-red-500/40     bg-red-500/10',
}

const DOT_COLORS: Record<string, string> = {
  cyan:    'fill-cyan-400    stroke-cyan-300',
  amber:   'fill-amber-400   stroke-amber-300',
  emerald: 'fill-emerald-400 stroke-emerald-300',
  red:     'fill-red-500     stroke-red-400',
}

const RING_COLORS: Record<string, string> = {
  cyan:    'stroke-cyan-400/40',
  amber:   'stroke-amber-400/40',
  emerald: 'stroke-emerald-400/40',
  red:     'stroke-red-400/40',
}

const LINE_COLORS: Record<string, string> = {
  ACTIVE:    'stroke-emerald-500/30',
  STANDBY:   'stroke-cyan-500/20',
  NULLIFIED: 'stroke-red-500/20',
}

export function NetworkMap() {
  const [selected, setSelected] = useState<string | null>('st_paul')
  const selectedNode = NODES.find(n => n.id === selected)
  const hub = NODES[0]

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-black/60 backdrop-blur-sm p-5">
      <h2 className="text-sm font-mono font-bold text-cyan-400 mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4" />
        SOVEREIGN NODE NETWORK — v4.5 QUANTUM_LOCKED
      </h2>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* SVG Map */}
        <div className="lg:col-span-2 relative rounded-lg bg-zinc-950/80 border border-zinc-800 overflow-hidden">
          <svg viewBox="0 0 980 540" className="w-full h-auto" aria-label="Sovereign node network map">
            {/* Grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff06" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="980" height="540" fill="url(#grid)" />

            {/* Lines from hub to each node */}
            {NODES.slice(1).map(n => (
              <line
                key={n.id}
                x1={hub.x} y1={hub.y}
                x2={n.x}   y2={n.y}
                strokeWidth="1"
                strokeDasharray={n.status === 'NULLIFIED' ? '4 4' : '0'}
                className={LINE_COLORS[n.status]}
              />
            ))}

            {/* Nodes */}
            {NODES.map(n => (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                onClick={() => setSelected(n.id)}
                className="cursor-pointer"
              >
                {/* Pulse ring for active */}
                {n.status === 'ACTIVE' && (
                  <circle r="18" fill="none" strokeWidth="1" className={RING_COLORS[n.color]} />
                )}
                <circle
                  r="9"
                  strokeWidth="1.5"
                  className={`${DOT_COLORS[n.color]} ${selected === n.id ? 'opacity-100' : 'opacity-75 hover:opacity-100'} transition-opacity`}
                />
                {/* State label */}
                <text
                  x="0" y="26"
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="monospace"
                  className="fill-zinc-400 select-none"
                >
                  {n.state}
                </text>
                <text
                  x="0" y="36"
                  textAnchor="middle"
                  fontSize="8"
                  fontFamily="monospace"
                  className="fill-zinc-500 select-none"
                >
                  {n.name}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Node Detail Panel */}
        <div className="space-y-3">
          {selectedNode ? (
            <div className="p-4 rounded-lg border border-zinc-700 bg-zinc-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-white">{selectedNode.name}</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded border ${STATUS_COLORS[selectedNode.status]}`}>
                  {selectedNode.status}
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                {[
                  ['Type',    selectedNode.type],
                  ['Load',    selectedNode.load],
                  ['Latency', selectedNode.latency],
                  ['Metrics', selectedNode.metrics],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-zinc-500 shrink-0">{k}</span>
                    <span className="text-zinc-200 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs font-mono text-zinc-500 text-center">
              Select a node on the map
            </div>
          )}

          {/* Node list */}
          <div className="space-y-1.5">
            {NODES.map(n => (
              <button
                key={n.id}
                onClick={() => setSelected(n.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${
                  selected === n.id ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-zinc-800 bg-black/30 hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${
                    n.color === 'cyan'    ? 'bg-cyan-400' :
                    n.color === 'amber'   ? 'bg-amber-400' :
                    n.color === 'emerald' ? 'bg-emerald-400' : 'bg-red-500'
                  }`} />
                  <span className="text-zinc-200">{n.name}</span>
                </div>
                <span className={`${STATUS_COLORS[n.status].split(' ')[0]}`}>{n.status}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
