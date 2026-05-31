'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ShieldCheck,
  AlertTriangle,
  Link2,
  KeyRound,
  FileCheck2,
  Lock,
  CheckCircle2,
  CircleDashed,
  Ban,
} from 'lucide-react'

interface ControlMap {
  control_family: string
  control_objective: string
  implementation_evidence: string
  sample_status: string
}

export interface AuditManifest {
  id: number
  schema_version: string
  attestation_id: string | null
  classification: string | null
  node: string | null
  decision: string | null
  event_type: string | null
  event_sequence: number | null
  required_role: string | null
  required_scope: string | null
  canonical_payload_hash: string | null
  event_hash: string | null
  data_snapshot_hash: string | null
  bundle_sha256: string | null
  mandatory_disclaimer: string | null
  sample_artifact: boolean
  external_certification_claimed: boolean
  bank_approval_claimed: boolean
  ready_for_validation: boolean
  control_mapping: ControlMap[] | null
  generated_at: string | null
  created_at: string
}

interface AuditComplianceProps {
  manifests: AuditManifest[]
}

const sampleStatusConfig: Record<
  string,
  { icon: typeof CheckCircle2; color: string; border: string }
> = {
  demonstrated: { icon: CheckCircle2, color: 'text-emerald-400', border: 'border-emerald-500/30' },
  'demonstrated with sample identities': {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  'target defined': { icon: CircleDashed, color: 'text-cyan-400', border: 'border-cyan-500/30' },
  'placeholder only': { icon: Ban, color: 'text-amber-400', border: 'border-amber-500/30' },
}

function HashRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-cyan-500/15 bg-cyan-500/5 p-3">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</span>
      <span className="break-all font-mono text-xs text-cyan-300">
        {value ?? 'PENDING_VERIFICATION'}
      </span>
    </div>
  )
}

export function AuditCompliance({ manifests }: AuditComplianceProps) {
  if (!manifests || manifests.length === 0) {
    return (
      <Card className="border-cyan-500/30 bg-black/60 backdrop-blur-sm">
        <CardHeader className="border-b border-cyan-500/20">
          <CardTitle className="flex items-center gap-2 font-mono text-cyan-400">
            <ShieldCheck className="h-5 w-5" />
            DIRS v2 AUDIT & COMPLIANCE
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="font-mono text-sm text-zinc-500">No audit manifests on record.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-cyan-500/30 bg-black/60 backdrop-blur-sm">
      <CardHeader className="border-b border-cyan-500/20">
        <CardTitle className="flex items-center justify-between gap-2 font-mono text-cyan-400">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            DIRS v2 AUDIT & COMPLIANCE
          </span>
          <Badge variant="outline" className="border-amber-500/40 font-mono text-[10px] text-amber-400">
            EXTERNAL CERT: NOT CLAIMED
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-4">
        {manifests.map((m) => {
          const isAllow = (m.decision ?? '').toLowerCase() === 'allow'
          return (
            <div key={m.id} className="space-y-4">
              {/* Manifest header */}
              <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
                <div className="min-w-0">
                  <div className="font-mono text-sm font-bold text-zinc-100">
                    {m.attestation_id ?? 'UNIDENTIFIED ATTESTATION'}
                  </div>
                  <div className="mt-1 font-mono text-xs text-zinc-500">
                    {m.schema_version} · {m.node ?? 'unknown node'} · seq {m.event_sequence ?? '—'}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      isAllow
                        ? 'border-emerald-500/40 font-mono text-emerald-400'
                        : 'border-red-500/40 font-mono text-red-400'
                    }
                  >
                    {isAllow ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <Ban className="mr-1 h-3 w-3" />}
                    {(m.decision ?? 'unknown').toUpperCase()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      m.ready_for_validation
                        ? 'border-cyan-500/40 font-mono text-cyan-400'
                        : 'border-zinc-500/40 font-mono text-zinc-400'
                    }
                  >
                    {m.ready_for_validation ? 'READY FOR VALIDATION' : 'UNSEALED'}
                  </Badge>
                </div>
              </div>

              {/* Mandatory disclaimer */}
              {m.mandatory_disclaimer && (
                <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
                  <div className="space-y-1">
                    <div className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
                      Mandatory Disclaimer — Sample Artifact
                    </div>
                    <p className="text-xs leading-relaxed text-amber-200/80">{m.mandatory_disclaimer}</p>
                  </div>
                </div>
              )}

              {/* Authorization decision */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-cyan-500/15 bg-black/40 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-500">
                    <FileCheck2 className="h-3 w-3" /> Event Type
                  </div>
                  <div className="font-mono text-sm text-zinc-200">{m.event_type ?? '—'}</div>
                </div>
                <div className="rounded-lg border border-cyan-500/15 bg-black/40 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-500">
                    <KeyRound className="h-3 w-3" /> Required Role
                  </div>
                  <div className="font-mono text-sm text-zinc-200">{m.required_role ?? '—'}</div>
                </div>
                <div className="rounded-lg border border-cyan-500/15 bg-black/40 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-500">
                    <Lock className="h-3 w-3" /> Required Scope
                  </div>
                  <div className="font-mono text-sm text-zinc-200">{m.required_scope ?? '—'}</div>
                </div>
              </div>

              {/* Hash chain */}
              <div>
                <div className="mb-2 flex items-center gap-2 font-mono text-xs text-zinc-500">
                  <Link2 className="h-3.5 w-3.5" />
                  CANONICAL HASH CHAIN
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <HashRow label="Canonical Payload Hash" value={m.canonical_payload_hash} />
                  <HashRow label="Event Hash" value={m.event_hash} />
                  <HashRow label="Data Snapshot Hash" value={m.data_snapshot_hash} />
                  <HashRow label="Final Bundle SHA-256" value={m.bundle_sha256} />
                </div>
              </div>

              {/* Control mapping */}
              {m.control_mapping && m.control_mapping.length > 0 && (
                <div>
                  <div className="mb-2 font-mono text-xs text-zinc-500">CONTROL FAMILY MAPPING</div>
                  <div className="grid gap-2">
                    {m.control_mapping.map((c, i) => {
                      const cfg =
                        sampleStatusConfig[c.sample_status] ?? {
                          icon: CircleDashed,
                          color: 'text-zinc-400',
                          border: 'border-zinc-500/30',
                        }
                      const Icon = cfg.icon
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-3 rounded-lg border border-cyan-500/15 bg-black/40 p-3"
                        >
                          <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cfg.color}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-mono text-sm font-medium text-zinc-200">
                                {c.control_family}
                              </span>
                              <Badge variant="outline" className={`${cfg.border} font-mono text-[10px] ${cfg.color}`}>
                                {c.sample_status}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-zinc-400">{c.control_objective}</p>
                            <p className="mt-1 font-mono text-[11px] text-zinc-600">{c.implementation_evidence}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
